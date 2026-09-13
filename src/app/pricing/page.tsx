"use client";

import Link from "next/link";
import { Check, CreditCard, Gift, Infinity, Sparkles, Crown } from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

/* ============================================================
 * VIP 状态 —— 纯前端 localStorage 自动化履约
 * ============================================================ */
const VIP_STORAGE_KEY = "coloringpages:vip:v1";
type VipStatus = {
  vip_status: "active" | "inactive";
  vip_type: "starter" | "lifetime" | null;
  purchased_at: number | null;
  order_id?: string;
};

const DEFAULT_VIP: VipStatus = {
  vip_status: "inactive",
  vip_type: null,
  purchased_at: null,
};

/* ============================================================
 * 套餐定义
 * ============================================================ */
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    desc: "Try it out",
    badge: undefined as string | undefined,
    icon: Gift,
    features: [
      "3 free generations per day",
      "Kids simple style + adult intricate style",
      "PNG / A4 PDF export",
      "Local history (last 5)",
      "Light watermark on output",
    ],
    cta: { label: "Start free", href: "/workspace", variant: "outline" as const },
    paypal: undefined,
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: "$4.99",
    desc: "Batch download + 100 HD generations",
    badge: "Popular",
    icon: Sparkles,
    features: [
      "100 watermark-free generations (never expire)",
      "Batch download (PNG + A4 PDF)",
      "Priority queue (faster rendering)",
      "Unlock adult zentangle themes",
    ],
    cta: { label: "Buy with PayPal", href: "#", variant: "default" as const },
    paypal: { amount: "4.99", planId: "starter" as const, vipType: "starter" as const },
  },
  {
    id: "lifetime",
    name: "Lifetime VIP",
    price: "$9.99",
    desc: "Forever unlimited + exclusive themes",
    badge: "Best value",
    icon: Infinity,
    features: [
      "Permanent unlimited generations (no daily cap)",
      "All outputs 100% watermark-free",
      "Exclusive Pro theme pack (500+ templates)",
      "Image-to-line-art (upcoming)",
      "Lifetime updates & new themes",
    ],
    cta: { label: "Get Lifetime VIP", href: "#", variant: "default" as const },
    paypal: { amount: "9.99", planId: "lifetime" as const, vipType: "lifetime" as const },
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
    const particles = Array.from({ length: 120 }, () => ({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.15,
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
        p.life -= 0.008;

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
        // 动画结束，延迟移除 canvas
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
 * 庆祝弹窗 —— 支付成功后弹出
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
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Start creating →
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * PayPal 按钮 —— 每个付费套餐独立实例
 * ============================================================ */
function PlanPayPalButton({
  amount,
  vipType,
  onSuccess,
  disabled,
}: {
  amount: string;
  vipType: "starter" | "lifetime";
  onSuccess: (vipType: "starter" | "lifetime") => void;
  disabled: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2">
      {disabled ? (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-lg border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
        >
          You already have VIP
        </button>
      ) : (
        <>
          <PayPalButtons
            disabled={pending}
            style={{ layout: "vertical", shape: "rect" }}
            createOrder={(_, actions) => {
              setPending(true);
              setError(null);
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: amount,
                    },
                    description: vipType === "lifetime"
                      ? "Lifetime VIP — Unlimited coloring page generations"
                      : "Starter Pack — 100 HD watermark-free generations",
                  },
                ],
              });
            }}
            onApprove={async (_, actions) => {
              try {
                if (!actions.order) {
                  throw new Error("PayPal order not found");
                }
                const details = await actions.order.capture();
                const orderId = details.id ?? "unknown";
                toast.success("Payment received! Activating VIP…", {
                  description: `Order: ${orderId.slice(0, 12)}…`,
                });
                onSuccess(vipType);
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Payment failed";
                toast.error(`Payment capture failed: ${msg}`);
                setError(msg);
                setPending(false);
              }
            }}
            onError={(err) => {
              console.error("[PayPal] onError:", err);
              setError("PayPal encountered an error. Please try again.");
              setPending(false);
            }}
            onCancel={() => {
              setPending(false);
              toast.info("Payment cancelled — no charges made.");
            }}
          />
          {pending && (
            <p className="text-center text-xs text-muted-foreground">Opening PayPal…</p>
          )}
          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}
        </>
      )}
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

  const handlePaypalSuccess = useCallback(
    (vipType: "starter" | "lifetime") => {
      setVip({
        vip_status: "active",
        vip_type: vipType,
        purchased_at: Date.now(),
      });
      setCelebrationPlan(
        vipType === "lifetime" ? "Lifetime VIP" : "Starter Pack"
      );
      setShowCelebration(true);
      setConfettiKey((k) => k + 1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // 每个 PayPal 按钮独立 disabled 状态
  const isVipActive = vip.vip_status === "active";

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const payPalAvailable = Boolean(clientId);

  return (
    <PayPalScriptProvider
      options={{
        clientId: clientId ?? "",
        currency: "USD",
        intent: "capture",
      }}
      deferLoading={false}
    >
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
              Start for free, upgrade only when you need more. All paid tiers are watermark-free.
            </p>
            {isVipActive && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-500/30">
                <Crown className="size-4" />
                You are a VIP Member{" "}
                {vip.vip_type === "lifetime" && <span>· Lifetime</span>}
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isPaid = Boolean(plan.paypal);
              const alreadyOwnsThisTier =
                isVipActive &&
                vip.vip_type === plan.paypal?.vipType;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-xl border bg-card p-5 transition hover:shadow-md ${
                    plan.badge ? "ring-2 ring-primary/20" : ""
                  }`}
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

                  {/* 免费套餐 → Link */}
                  {!isPaid && (
                    <Link
                      href={plan.cta.href}
                      className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-accent"
                    >
                      {plan.cta.label}
                    </Link>
                  )}

                  {/* 付费套餐 → PayPal SDK 按钮 */}
                  {isPaid && plan.paypal && (
                    <>
                      {!payPalAvailable ? (
                        <div className="rounded-lg border bg-muted p-3 text-center text-xs text-muted-foreground">
                          <p className="mb-1 font-medium text-foreground">
                            PayPal not configured yet
                          </p>
                          <p>Contact support to activate payments.</p>
                        </div>
                      ) : alreadyOwnsThisTier ? (
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                        >
                          ✓ You own this plan
                        </button>
                      ) : isVipActive ? (
                        // Lifetime 用户不用再买 Starter
                        <button
                          disabled
                          className="w-full cursor-not-allowed rounded-lg border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                        >
                          ✓ Upgrade to Lifetime for full access
                        </button>
                      ) : (
                        <PlanPayPalButton
                          amount={plan.paypal.amount}
                          vipType={plan.paypal.vipType}
                          onSuccess={handlePaypalSuccess}
                          disabled={isVipActive}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 购买说明 */}
          <div className="mx-auto mt-12 max-w-2xl rounded-xl border bg-muted/40 p-5 text-xs text-muted-foreground">
            <p className="mb-2 font-medium text-foreground">📌 How to pay & activate</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Click the PayPal button — pay securely in a popup. No account required.
              </li>
              <li>
                Your VIP status unlocks <strong>instantly</strong> after payment.
                No email, no waiting.
              </li>
              <li>
                VIP is stored in your browser. On a new device, sign in with the
                same PayPal account and re-purchase, or email us at{" "}
                <code className="rounded bg-muted px-1">
                  xingfang.wang@gmail.com
                </code>{" "}
                with your order ID for manual activation.
              </li>
              <li>
                By purchasing you agree to our Terms of Service. Lifetime plans
                never expire.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </PayPalScriptProvider>
  );
}
