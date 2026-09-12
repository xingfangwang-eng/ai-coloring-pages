import Link from "next/link";
import { Brush } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Brush className="h-3.5 w-3.5" />
          <span>
            © {new Date().getFullYear()} AI Coloring Pages · Free coloring line art generator
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
