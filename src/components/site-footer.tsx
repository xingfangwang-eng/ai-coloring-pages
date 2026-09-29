import Link from "next/link";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-xs text-muted-foreground sm:flex-row">
        {/* 左侧：版权与站点名 */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>
            © {new Date().getFullYear()} PowerReady Hub · Emergency backup & portable solar guides
          </span>
        </div>

        {/* 右侧：合规导航链接 */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/sitemap.xml" className="hover:text-foreground">
            Sitemap
          </Link>
          <a
            href="mailto:xingfang.wang@gmail.com"
            className="hover:text-foreground"
          >
            Contact
          </a>
        </div>
      </div>

      {/* 底部居中：亚马逊联盟官方强制免责声明（通过审核的关键） */}
      <div className="mx-auto mt-4 max-w-4xl px-6 text-center text-[11px] leading-relaxed text-muted-foreground/80">
        <p>
          <strong>Affiliate Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
        </p>
      </div>
    </footer>
  );
}