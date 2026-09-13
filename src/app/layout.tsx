import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  title: "AI Coloring Pages · Free Line Art Generator",
  description:
    "Type a word, get a printable black & white line art coloring page. 100% free, no sign-up required.",
  verification: {
    google: "uTT2vLHXrvh44esSpln_EMc1QEFjkN0vjJZ04UgI0Qc",
  },
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
        <SiteNavbar />
        {children}
        <SiteFooter />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
