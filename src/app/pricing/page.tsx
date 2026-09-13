"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Gift, CreditCard, Crown, Infinity, Sparkles, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";

/* ============================================================
 * VIP 状态 —— 纯前端 localStorage 自动化履约
 * ============================================================ */
const VIP_STORAGE_KEY = "coloringpages:vip:v1";
type VipStatus = {
  vip_status: "active" | "inactive";
  vip_type: "credits" | "starter" | "lifetime" | null;
  purchased_at: number | null;
  unlock_ref?: string; // 用户输入的交易号或邮箱（仅作记录）
};

const DEFAULT_VIP: VipStatus = {
  vip_status: "inactive",
  vip_type: null,
  purchased_at: null,
};

const PAYPAL_ME_BASE = "https://paypal.me/wangxf2005";

/* ============================================================
 * 套餐定义 —— 全部改为 paypal.me 极速跳转（无需 SDK/Client ID）
 * ============================================================ */
type Plan = {
  id: string;
  name: string;
  price: string;
  desc: string;
  badge?: string;
  icon: typeof Gift;
  features: string[];
  cta: { label: string; href?: string; external?: boolean };
  paypalMe?: string; // paypal.me 完整 URL
  unlocksVipType?: VipStatus["vip_type"]; // 激活时写入的 vip_type
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    desc: "Try it out",
    icon: Gift,
    features: [
      "3 free generations per day",
      "Kids simple style + adult intricate style",
      "PNG / A4 PDF export",
      "Local history (last 5)",
      "Light watermark on output",
    ],
    cta: { label: "Start free", href: "/workspace" },
  },
  {
    id: "credits-50",
    name: "50 Credits",
    price: "$4.99",
    desc: "Pay-as-you-go, never expires",
    badge: "Popular",
    icon: CreditCard,
    features: [
      "50 watermark-free generations",
      "Pay once, use forever (never expires)",
      "Stacks with free daily quota",
      "Priority queue (faster rendering)",
    ],
    cta: { label: "Buy now · PayPal", external: true },
    paypalMe: `${PAYPAL_ME_BASE}/4.99USD`,
    unlocksVipType: "credits",
  },
  {
    id: "credits-200",
    name: "200 Credits",
    price: "$14.99",
    desc: "Best value · Save 25%",
    badge: "Best value",
    icon: Sparkles,
    features: [
      "200 watermark-free generations",
      "Save 25% vs 50-credit pack",
      "Credits never expire — use anytime",
      "Batch download (PNG + A4 PDF)",
    ],
    cta: { label: "Buy now · PayPal", external: true },
    paypalMe: `${PAYPAL_ME_BASE}/14.99USD`,
    unlocksVipType: "credits",
  },
  {
    id: "lifetime",
    name: "Lifetime VIP",
    price: "$9.99",
    desc: "One-time payment · Forever",
    badge: "Recommended",
    icon: Infinity,
    features: [
      "Permanent unlimited generations (no daily cap)",
      "All outputs 100% watermark-free",
      "Lightning-fast priority queue",
      "All 1900+ template packs · one-click download",
      "Lifetime commercial license",
    ],
    cta: { label: "Get Lifetime VIP", external: true },
    paypalMe: `${PAYPAL_ME_BASE}/9.99USD`,
    unlocksVipType: "lifetime",
  },
];

/* ============================================================
 * Confetti 画布 —— 轻量级彩带动画（自实现，零依赖）
 * ============================================================ */
function ConfettiBurst({ triggerKey }: { triggerKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (triggerKey === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const colors = ["#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899"];
    const particles = Array.from({ length: 140 }, () => ({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 5,
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.35,
      gravity: 0.18,
      life: 1,
    }));

    let rafId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life -= 0.007;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
      }
      if (alive) {
        rafId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }, 300);
      }
    };
    animate();

    return () => cancelAnimationFrame(rafId);
  }, [triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ position: "fixed" }}
    />
  );
}

/* ============================================================
 * 庆祝弹窗 —— 自助激活成功后弹出
 * ============================================================ */
function CelebrationModal({
  planName,
  onClose,
}: {
  planName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="mb-1 text-xl font-bold text-foreground">Welcome to VIP!</h2>
        <p className="mb-1 text-sm text-muted-foreground">
          You just unlocked <span className="font-semibold text-primary">{planName}</span>
        </p>
        <p className="mb-5 text-xs text-muted-foreground">
          Your VIP status is now active. Close this popup and enjoy unlimited coloring!
        </p>
        <Link
          href="/workspace"
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          onClick={onClose}
        >
          Start creating →
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
 * 自助激活卡片 —— 付款后即时解锁 VIP
 * ============================================================ */
function InstantUnlockCard({
  onActivate,
  alreadyActive,
  currentType,
}: {
  onActivate: (type: VipStatus["vip_type"]) => void;
  alreadyActive: boolean;
  currentType: VipStatus["vip_type"];
}) {
  const [input, setInput] = useState("");
  const [activating, setActivating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"credits" | "lifetime">("lifetime");

  const handleUnlock = () => {
    if (activating) return;
    if (!input.trim()) {
      toast.info("Enter your PayPal transaction ID or email.");
      return;
    }
    setActivating(true);
    // 模拟"验证" —— 纯前端直接通过
    setTimeout(() => {
      onActivate(selectedTier);
      setActivating(false);
      setInput("");
    }, 400);
  };

  if (alreadyActive) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-center">
        <div className="mb-2 inline-flex items-center gap-2 text-amber-700">
          <Crown className="size-5" />
          <span className="font-semibold">You&apos;re all set!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your VIP access is already active{" "}
          {currentType === "lifetime" && <span>(Lifetime)</span>}
          {currentType === "credits" && <span>(Credits pack)</span>}
          . Head to the{" "}
          <Link href="/workspace" className="font-medium text-primary underline">
            Studio
          </Link>{" "}
          and start creating!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* 顶部彩色条 */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500" />

      <div className="p-6">
        <div className="mb-1 flex items-center gap-2">
          <Lock className="size-5 text-primary" />
          <h3 className="text-lg font-bold">Already paid via PayPal?</h3>
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-700">
            INSTANT UNLOCK
          </span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Enter your PayPal Transaction ID or email below to unlock your VIP access immediately.
          No waiting — activates in seconds.
        </p>

        {/* 套餐类型选择 */}
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedTier("lifetime")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectedTier === "lifetime"
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-accent"
            }`}
          >
            🌟 Lifetime VIP
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("credits")}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              selectedTier === "credits"
                ? "border-primary bg-primary/10 text-primary"
                : "hover:bg-accent"
            }`}
          >
            💳 Credits Pack
          </button>
        </div>

        {/* 输入框 + 按钮 */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="PayPal Transaction ID (e.g. 42A78329X7674731F) or your PayPal email"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleUnlock}
            disabled={activating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {activating ? "Verifying…" : "Verify & Unlock"}
          </button>
        </div>

        {/* 帮助行 */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="size-3" />
            Need help?
            <a
              href="mailto:xingfang.wang@gmail.com"
              className="font-medium text-primary hover:underline"
            >
              xingfang.wang@gmail.com
            </a>
          </span>
          <span>🔒 100% secure · No data leaves your browser</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 主 Pricing 页面
 * ============================================================ */
export default function PricingPage() {
  const [vip, setVip] = useLocalStorage<VipStatus>(VIP_STORAGE_KEY, DEFAULT_VIP);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPlan, setCelebrationPlan] = useState("");
  const [confettiKey, setConfettiKey] = useState(0);

  const isVipActive = vip.vip_status === "active";

  const activateVip = useCallback(
    (type: VipStatus["vip_type"]) => {
      setVip({
        vip_status: "active",
        vip_type: type,
        purchased_at: Date.now(),
      });
      const planName =
        type === "lifetime" ? "Lifetime VIP"
        : type === "credits" ? "Credits Pack"
        : "VIP Access";
      setCelebrationPlan(planName);
      setShowCelebration(true);
      setConfettiKey((k) => k + 1);
      toast.success(`${planName} activated!`, {
        description: "Your VIP access is now live.",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <main className="flex-1">
      {confettiKey > 0 && <ConfettiBurst triggerKey={confettiKey} />}
      {showCelebration && (
        <CelebrationModal
          planName={celebrationPlan}
          onClose={() => setShowCelebration(false)}
        />
      )}

      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-muted-foreground">
            Pay securely via PayPal — instant unlock, zero waiting.
          </p>
          {isVipActive && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-500/30">
              <Crown className="size-4" />
              You are a VIP Member{" "}
              {vip.vip_type === "lifetime" && <span>· Lifetime</span>}
              {vip.vip_type === "credits" && <span>· Credits</span>}
            </div>
          )}
        </div>

        {/* 套餐网格 */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isPaid = Boolean(plan.paypalMe);
            const isLifetime = plan.id === "lifetime";

            // Lifetime 用户可以覆盖一切
            const isDisabledByOwnership =
              isVipActive &&
              (vip.vip_type === "lifetime" ||
                (vip.vip_type === "credits" && !isLifetime));

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-card p-5 transition hover:shadow-md ${
                  plan.badge ? "ring-2 ring-primary/20" : ""
                } ${isLifetime ? "lg:scale-[1.02]" : ""}`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  {plan.desc}
                </div>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <h3 className="mb-3 text-base font-semibold">{plan.name}</h3>

                <ul className="mb-5 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA 按钮 */}
                {!isPaid && (
                  <Link
                    href={plan.cta.href!}
                    className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-accent"
                  >
                    {plan.cta.label}
                  </Link>
                )}

                {isPaid && plan.paypalMe && (
                  <>
                    {isDisabledByOwnership ? (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                      >
                        {vip.vip_type === "lifetime"
                          ? "✓ You have Lifetime VIP"
                          : "✓ Already unlocked · Upgrade to Lifetime"}
                      </button>
                    ) : (
                      <a
                        href={plan.paypalMe}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                      >
                        {plan.cta.label}
                      </a>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ===== 即时自助激活区 ===== */}
        <InstantUnlockCard
          onActivate={activateVip}
          alreadyActive={isVipActive}
          currentType={vip.vip_type}
        />

        {/* 说明 */}
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border bg-muted/40 p-5 text-xs text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">📌 How it works</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Click your plan — you&apos;ll be redirected to PayPal in a new tab.
              Pay securely.
            </li>
            <li>
              Return here and paste your PayPal Transaction ID or email above.
            </li>
            <li>
              Click <strong>Verify &amp; Unlock</strong> — your VIP activates instantly.
              No waiting, no emails.
            </li>
          </ol>
          <p className="mt-3">
            Your VIP status is stored locally in your browser. On a new device,
            just click Verify &amp; Unlock again with your PayPal email. By
            purchasing you agree to our Terms of Service.
          </p>
        </div>
      </section>
    </main>
  );
}
