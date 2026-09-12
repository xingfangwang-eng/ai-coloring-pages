import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getQuotaState } from "@/lib/credits";
import { ArrowRight, CreditCard, Crown, Sparkles, User } from "lucide-react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              Sign in to view your account and cloud history
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/api/auth/signin">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const uid = session.user.id!;
  const quota = await getQuotaState(uid);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              className="h-14 w-14 rounded-full border bg-muted"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {session.user.name ?? session.user.email ?? "User"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {session.user.email ?? ""}
            </p>
          </div>
        </div>

        {/* 配额概览 */}
        <div className="grid gap-4 sm:grid-cols-3">
          <QuotaCard
            title="Plan"
            value={quota.plan === "pro" ? "Pro" : "Free"}
            icon={quota.plan === "pro" ? Crown : Sparkles}
            accent={quota.plan === "pro" ? "text-amber-500" : "text-muted-foreground"}
          />
          <QuotaCard
            title="Free today"
            value={`${quota.freeRemaining} / 3`}
            subtitle={`Used ${quota.freeUsedToday}`}
            icon={Sparkles}
          />
          <QuotaCard
            title="Credits"
            value={quota.creditsRemaining.toString()}
            subtitle={`Lifetime ${quota.creditsTotal}`}
            icon={CreditCard}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/workspace">
              Start generating
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Upgrade</Link>
          </Button>
        </div>

        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Account info</CardTitle>
            <CardDescription>
              Identity provided by your sign-in provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="User ID" value={uid} mono />
            <InfoRow label="Email" value={session.user.email ?? "-"} />
            <InfoRow label="Sign-in method" value="GitHub / Email magic link" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function QuotaCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${accent ?? "text-primary"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
