import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "Zoumani Frontend Foundation",
  description: "Architecture frontend production-ready pour Zoumani.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
