import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Emergency Power Hub | Portable Power Stations & Solar Generators',
  description: 'Compare battery runtime, solar charging speeds, and backup power setups for storm outages.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google Analytics 统计代码 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L2YZZBNMCR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L2YZZBNMCR');
          `}
        </Script>

        {/* 顶部导航栏 */}
        <SiteNavbar />

        {/* 页面主体内容（首页 page.tsx 或后续子页面都渲染在这里） */}
        <main className="flex-1">
          {children}
        </main>

        {/* 底部页脚 */}
        <SiteFooter />

        {/* 提示弹窗组件 */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}