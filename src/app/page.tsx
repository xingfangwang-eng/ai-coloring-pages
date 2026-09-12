import Link from "next/link";
import {
  Brush,
  Code2,
  Download,
  FileDown,
  History,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "AI Coloring Pages · Free Line Art Generator",
};

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            100% Free · No API Key required · Powered by Pollinations.ai
          </div>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            One prompt to generate printable
            <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
              {" "}coloring line art
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            For kids or for yourself — type a simple description ("kitten sitting on a pumpkin"), and AI turns it into a professional black & white line drawing.
            Export high-res PNG or A4-ready PDF in one click.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/workspace"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
            >
              <Brush className="h-4 w-4" />
              Start generating
            </Link>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-background px-6 text-sm font-medium transition hover:bg-accent"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Why AI Coloring Pages
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Smart Prompt Enhancement"
            desc="You describe it in plain language; AI wraps it into a pro coloring-page prompt: forced black & white, pure white background, bold strokes, no shading."
          />
          <FeatureCard
            icon={<Download className="h-5 w-5" />}
            title="High-Res PNG Export"
            desc="Download at original resolution — perfect for social sharing, further editing, or DIY coloring."
          />
          <FeatureCard
            icon={<FileDown className="h-5 w-5" />}
            title="A4 Printable PDF"
            desc="Auto-centered layout via jsPDF — send straight to the printer or share with your child's class."
          />
          <FeatureCard
            icon={<Brush className="h-5 w-5" />}
            title="Kids & Adults Styles"
            desc="Bold simple strokes for kids versus intricate mandala patterns for adults — toggle with one switch."
          />
          <FeatureCard
            icon={<History className="h-5 w-5" />}
            title="Local History"
            desc="Even without signing in, your last 5 creations are saved locally so you can revisit or re-export anytime."
          />
          <FeatureCard
            icon={<Code2 className="h-5 w-5" />}
            title="Open Source & Self-Hostable"
            desc="Built with Next.js + Tailwind + shadcn/ui. Deploy for free on Vercel Hobby in one click."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
