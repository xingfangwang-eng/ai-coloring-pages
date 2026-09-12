import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About · AI Coloring Pages",
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">About us</h1>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">AI Coloring Pages</strong>{" "}
            is a tiny tool that turns any description into a black & white coloring page using AI.
            Type a simple prompt (like "a kitten sitting on a pumpkin") and get a printable line art in seconds.
          </p>
          <p>
            We want every family to have easy access to high-quality coloring material —
            for kids' play, your own relaxation, or school crafts.
          </p>

          <h2 className="pt-4 text-lg font-semibold text-foreground">Tech stack</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Next.js + TypeScript + Tailwind CSS + shadcn/ui</li>
            <li>AI generation: Pollinations.ai (fully free, no API Key required)</li>
            <li>Auth: NextAuth + GitHub OAuth + email magic link</li>
            <li>Database & cloud history: Supabase PostgreSQL</li>
            <li>Deployment: Vercel Hobby (free)</li>
          </ul>

          <h2 className="pt-4 text-lg font-semibold text-foreground">Get in touch</h2>
          <p>
            Suggestions, bug reports, or partnership ideas?
            Feel free to email{" "}
            <a
              href="mailto:xingfang.wang@gmail.com"
              className="text-primary underline"
            >
              xingfang.wang@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
