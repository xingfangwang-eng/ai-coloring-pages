"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * 已知 provider 的品牌配置（icon / 颜色 / 显示名）
 * 没在列表里的 provider 会用默认样式兜底
 */
const PROVIDER_META: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  github: {
    label: "GitHub",
    color: "text-white",
    bg: "bg-[#24292f] hover:bg-[#1f2428]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  google: {
    label: "Google",
    color: "text-[#1a73e8]",
    bg: "bg-white border border-input hover:bg-muted/60",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3 14.7 2 12 2 6.5 2 2.1 6.4 2.1 12S6.5 22 12 22c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1.3H12z"
        />
      </svg>
    ),
  },
  discord: {
    label: "Discord",
    color: "text-white",
    bg: "bg-[#5865F2] hover:bg-[#4752c4]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  email: {
    label: "Email",
    color: "text-foreground",
    bg: "bg-white border border-input hover:bg-muted/60",
    icon: <UserRound className="size-4" />,
  },
};

export function LoginButton() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<string[]>([]);

  // 动态拉取当前启用的 provider 列表
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/providers")
      .then((r) => (cancelled ? null : r.json()))
      .then((data) => {
        if (cancelled || !data) return;
        setProviders(Object.keys(data));
      })
      .catch(() => {
        // fetch 失败不做什么（比如 dev 环境下还没 ready）
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- 加载态 ----
  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="size-3.5 animate-spin" />
        Loading...
      </Button>
    );
  }

  // ---- 已登录 ----
  if (session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await signOut({ redirect: false });
        }}
        className="gap-2"
      >
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="size-4 rounded-full"
          />
        )}
        <span className="hidden sm:inline">
          {session.user.name ?? session.user.email ?? "User"}
        </span>
        <LogOut className="size-3.5" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    );
  }

  // ---- 未登录 ----
  // providers 列表从 /api/auth/providers 动态拉取（依赖服务端环境变量）
  // 在 Vercel 上服务端已配置 GITHUB_CLIENT_ID/SECRET → providers 里会有 github
  // 注意：客户端**不应该**负责"是否配置"的判断，那是服务端的事。
  // 这里 providers.length === 0 可能只是 fetch 还没完成 —— 给一个可点击的 fallback

  // providers 还没到 → 给一个可点击的 "Sign in" 按钮（Dialog 里按 providers 渲染，
  // 如果 providers 还是空的就显示 "Loading..." 提示）
  if (providers.length === 0) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            Sign In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to AI Coloring Pages</DialogTitle>
            <DialogDescription>
              Choose how to sign in. Your history syncs automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            {/* providers 还在拉取中 —— 显示 loading 按钮作为占位 */}
            <Button variant="outline" disabled className="w-full justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Loading sign-in options...
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 只有 1 个 provider —— 直接点按钮就跳
  if (providers.length === 1) {
    const p = PROVIDER_META[providers[0]];
    return (
      <Button
        size="sm"
        onClick={() => signIn(providers[0])}
        className={cn("gap-2", p?.bg, p?.color)}
      >
        {p?.icon}
        Continue with {p?.label ?? providers[0]}
      </Button>
    );
  }

  // 多个 provider —— 弹出 Dialog 让用户选
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign in to AI Coloring Pages</DialogTitle>
          <DialogDescription>
            Choose how to sign in. Your history syncs automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          {providers.map((p) => {
            const meta = PROVIDER_META[p];
            return (
              <Button
                key={p}
                variant={meta?.bg?.includes("border") ? "outline" : "default"}
                onClick={() => signIn(p)}
                className={cn(
                  "w-full justify-center gap-2",
                  meta?.bg,
                  meta?.color
                )}
              >
                {meta?.icon}
                Continue with {meta?.label ?? p}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
