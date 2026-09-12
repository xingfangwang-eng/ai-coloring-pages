import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · AI Coloring Pages",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Last updated: September 2026</p>

          <h2 className="text-base font-semibold text-foreground">
            What we collect
          </h2>
          <p>
            When you sign in with GitHub or email, we receive your email address and GitHub user ID.
            The coloring-page descriptions you enter and the generated line art images are stored in our database
            to power your history and to help us improve AI prompt templates in the future.
          </p>

          <h2 className="text-base font-semibold text-foreground">
            How we use it
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Authentication: identify you and prevent abuse of paid features</li>
            <li>History: let you retrieve previous line arts on any device</li>
            <li>Quota enforcement: control daily generation limits by plan</li>
            <li>Improvement: anonymized aggregated data helps us refine prompt templates</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground">
            What we do NOT do
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>We never sell your email address to third parties</li>
            <li>We never send marketing emails without your consent</li>
            <li>We never make your generations visible to other users</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground">
            Data deletion
          </h2>
          <p>
            Want us to delete all of your data? Email{" "}
            <a href="mailto:xingfang.wang@gmail.com" className="text-primary">
              xingfang.wang@gmail.com
            </a>
            — we'll process your request within 72 hours.
          </p>
        </div>
      </section>
    </main>
  );
}
