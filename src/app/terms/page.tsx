import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · AI Coloring Pages",
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Last updated: September 2026</p>

          <h2 className="text-base font-semibold text-foreground">
            1. Nature of the service
          </h2>
          <p>
            AI Coloring Pages provides an AI-powered line-art coloring-page generation service.
            We may adjust, pause, or discontinue the service at any time without notice.
          </p>

          <h2 className="text-base font-semibold text-foreground">
            2. Your content
          </h2>
          <p>
            By default, the prompts you enter and the images you generate are yours.
            We claim no rights to your content, but we do reserve the right to store and process it solely to operate the service.
          </p>

          <h2 className="text-base font-semibold text-foreground">
            3. Free vs. paid
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Free users get 3 generations per day; outputs carry a light watermark</li>
            <li>Credit pack users spend 1 credit per generation, get no watermark, and credits never expire</li>
            <li>Pro is a monthly subscription with unlimited generations + priority queue</li>
            <li>All payments are processed via PayPal — we never handle your payment details</li>
            <li>Activation is manual on our side, so please email us your order ID after payment</li>
          </ul>

          <h2 className="text-base font-semibold text-foreground">
            4. Refund policy
          </h2>
          <p>
            Because we provide a digital, consumable service (credits are spent upon use; Pro starts billing immediately),
            we do not offer refunds by default. If the service is completely inaccessible within the first 24 hours after payment,
            please email us and we'll work out a solution.
          </p>

          <h2 className="text-base font-semibold text-foreground">
            5. Disclaimer
          </h2>
          <p>
            Generated line art is produced automatically by AI and may not be fully accurate or match your expectations.
            We are not liable for any direct or indirect loss arising from the use of this service.
          </p>
        </div>
      </section>
    </main>
  );
}
