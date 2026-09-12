import Link from "next/link";
import { Check, CreditCard, Gift, Infinity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAYPAL_BASE = "https://paypal.me/wangxf2005";

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
  },
  {
    id: "credits-50",
    name: "50 Credits",
    price: "$4.9",
    desc: "Pay-as-you-go, never expires",
    badge: "Popular",
    icon: Sparkles,
    features: [
      "50 watermark-free generations",
      "Stacked on top of your daily free quota",
      "Credits never expire",
      "Auto cloud sync when signed in",
    ],
    cta: {
      label: "Buy now",
      href: `${PAYPAL_BASE}/4.9`,
      variant: "default" as const,
      external: true,
    },
  },
  {
    id: "credits-200",
    name: "200 Credits",
    price: "$14.9",
    desc: "Best value",
    badge: "Best value",
    icon: CreditCard,
    features: [
      "200 watermark-free generations",
      "Save 20% vs the 50-credit pack",
      "Credits never expire",
      "Auto cloud sync when signed in",
    ],
    cta: {
      label: "Buy now",
      href: `${PAYPAL_BASE}/14.9`,
      variant: "default" as const,
      external: true,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.9/month",
    desc: "Unlimited generations",
    badge: "Recommended",
    icon: Infinity,
    features: [
      "Unlimited generations (no daily cap)",
      "All outputs watermark-free",
      "Priority queue (faster rendering)",
      "Unlimited cloud history storage",
      "Image-to-line-art support",
    ],
    cta: {
      label: "Upgrade to Pro",
      href: `${PAYPAL_BASE}/9.9`,
      variant: "default" as const,
      external: true,
    },
  },
];

export default function PricingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-muted-foreground">
            Start for free, upgrade only when you need more. All paid tiers are watermark-free.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
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

                {plan.cta.external ? (
                  <Button asChild className="w-full" variant={plan.cta.variant}>
                    <a
                      href={plan.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {plan.cta.label}
                    </a>
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={plan.cta.variant}>
                    <Link href={plan.cta.href}>{plan.cta.label}</Link>
                  </Button>
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
              Click Buy now and you'll be redirected to secure PayPal checkout. After payment, please email our support team at{" "}
              <code className="rounded bg-muted px-1">
                xingfang.wang@gmail.com
              </code>{" "}
              with your PayPal order ID — we'll activate your credits or Pro plan within 24 hours.
            </li>
            <li>
              Pro is a monthly subscription. When it expires, your plan reverts to the free tier (any remaining credits are kept).
            </li>
            <li>
              If you run into any issues at all, reach out by email and we'll get back to you as soon as possible.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
