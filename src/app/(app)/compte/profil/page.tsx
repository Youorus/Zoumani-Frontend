import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { ComingSoon } from "@/features/account/components/coming-soon";
import { accountContent } from "@/features/account/content/account-content";

export const metadata: Metadata = {
  title: accountContent.menu.profile,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ComingSoon title={accountContent.menu.profile} icon={UserRound} />;
}
