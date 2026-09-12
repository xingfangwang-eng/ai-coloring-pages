"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Brush, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Studio", href: "/workspace" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function SiteNavbar() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Brush className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI Coloring Pages</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {status === "authenticated" && (
            <Link
              href="/profile"
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Account
            </Link>
          )}
        </nav>

        {/* Right: login + mobile toggle */}
        <div className="flex items-center gap-2">
          <LoginButton />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          "overflow-hidden border-t md:hidden",
          open ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {status === "authenticated" && (
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Account
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
