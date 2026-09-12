/**
 * Supabase 数据库 Schema v2
 * ------------------------
 * 在 Supabase SQL Editor 里整体粘贴执行即可。幂等，可重复运行。
 *
 * 包含：
 *   1. profiles 表 —— 用户的会员等级 + 积分（新用户自动建）
 *   2. credits_ledger —— 积分变动流水（谁/多少/原因）
 *   3. coloring_pages —— 着色页历史（原表保留）
 *   4. 所有表的 RLS 策略
 *   5. 触发器 —— auth.users 插入时自动建 profiles
 */

-- ================================================================
-- 0. ENUM 类型：会员等级
-- ================================================================
do $$ begin
  create type public.plan_tier as enum ('free', 'pro');
exception when duplicate_object then null; end $$;

-- ================================================================
-- 1. profiles —— 用户档案 & 配额
-- ================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  plan            public.plan_tier not null default 'free',
  credits         integer not null default 30,          -- 总积分余额
  credits_used    integer not null default 0,           -- 已消耗积分
  daily_free_used integer not null default 0,           -- 今日免费次数（每次免费生成 +1）
  daily_free_date date not null default current_date,   -- 今日日期（每日自动归零）
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 索引
create index if not exists profiles_plan_idx on public.profiles(plan);

-- RLS
alter table public.profiles enable row level security;
drop policy if exists "profiles: read own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ================================================================
-- 2. credits_ledger —— 积分流水（只有服务端能 insert）
-- ================================================================
create table if not exists public.credits_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  delta       integer not null,                    -- +100 / -1 等
  reason      text not null,                       -- "manual_purchase" / "generate" / "admin_grant"
  ref_id      text,                                -- paypal order id / 其他外部引用
  created_at  timestamptz not null default now()
);

create index if not exists credits_ledger_user_idx
  on public.credits_ledger(user_id, created_at desc);

-- RLS：用户只能读自己的流水；写入由服务端 (service_role) 绕过 RLS 完成
alter table public.credits_ledger enable row level security;
drop policy if exists "credits_ledger: read own" on public.credits_ledger;

create policy "credits_ledger: read own"
  on public.credits_ledger for select
  using (auth.uid() = user_id);

-- ================================================================
-- 3. auth.users → profiles 自动触发器
--    新用户注册后自动建 profiles 行（默认 free plan + 30 credits）
-- ================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- 4. coloring_pages —— 着色页历史（原表保留 + 新增 is_free / watermark 字段）
-- ================================================================
alter table public.coloring_pages add column if not exists is_free boolean not null default true;
alter table public.coloring_pages add column if not exists has_watermark boolean not null default false;
alter table public.coloring_pages add column if not exists source text not null default 'text_to_lineart';

-- 原有 RLS 逻辑不变（用户只能读写删自己的）

-- ================================================================
-- 5. 配额检查辅助函数（可选，方便在 SQL / RPC 里调用）
-- ================================================================
create or replace function public.consume_generation(p_uid uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_allowed boolean;
  v_reason  text := '';
  v_free_remaining integer := 0;
  v_credits_remaining integer := 0;
begin
  select * into v_profile from public.profiles where id = p_uid;
  if not found then
    return jsonb_build_object('allowed', false, 'reason', 'profile_not_found');
  end if;

  -- 每天日期归零
  if v_profile.daily_free_date != current_date then
    update public.profiles set daily_free_used = 0, daily_free_date = current_date where id = p_uid;
    v_profile.daily_free_used := 0;
  end if;

  -- Pro 会员无限制
  if v_profile.plan = 'pro' then
    v_allowed := true;
  elsif v_profile.daily_free_used < 3 then
    v_allowed := true;
    update public.profiles
      set daily_free_used = daily_free_used + 1,
          updated_at = now()
      where id = p_uid;
  elsif v_profile.credits > 0 then
    v_allowed := true;
    update public.profiles
      set credits = credits - 1,
          credits_used = credits_used + 1,
          updated_at = now()
      where id = p_uid;
  else
    v_allowed := false;
    v_reason := 'quota_exhausted';
  end if;

  select * into v_profile from public.profiles where id = p_uid;
  v_free_remaining := greatest(0, 3 - v_profile.daily_free_used);
  v_credits_remaining := v_profile.credits;

  return jsonb_build_object(
    'allowed', v_allowed,
    'plan', v_profile.plan,
    'reason', v_reason,
    'free_remaining', v_free_remaining,
    'credits_remaining', v_credits_remaining,
    'credits_total', v_profile.credits + v_profile.credits_used
  );
end;
$$;
