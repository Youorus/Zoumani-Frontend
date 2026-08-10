import Link from "next/link";
import type { PropsWithChildren } from "react";

import { BrandMark } from "@/components/shared/brand-mark";

import { Container } from "./container";
import { ThemeSwitcher } from "./theme-switcher";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-[var(--z-nav)] border-b border-border/80 bg-background/90 backdrop-blur">
        <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="w-fit">
              <BrandMark />
            </Link>
            <nav className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
              <Link
                href="/"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Foundation
              </Link>
              <Link
                href="/trips"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Trips Reference
              </Link>
            </nav>
          </div>

          <ThemeSwitcher />
        </Container>
      </header>

      <main className="py-8 sm:py-10">{children}</main>
    </div>
  );
}
