import type { Metadata } from "next";
import { Package } from "lucide-react";

import { ComingSoon } from "@/features/account/components/coming-soon";
import { accountContent } from "@/features/account/content/account-content";

export const metadata: Metadata = {
  title: accountContent.menu.shipments,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ComingSoon title={accountContent.menu.shipments} icon={Package} />;
}
