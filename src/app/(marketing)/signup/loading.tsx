import { LoaderCircle } from "lucide-react";

import { signupContent } from "@/features/account/content/signup-content";
import { VisitorFlowPage } from "@/features/visitor-flow/components/visitor-flow-page";

export default function LoadingSignupPage() {
  return (
    <VisitorFlowPage contextLabel={signupContent.fr.contextLabel} language="fr">
      <div
        className="mx-auto grid min-h-[32rem] max-w-5xl place-items-center text-primary"
        aria-busy="true"
      >
        <LoaderCircle className="animate-spin" size={34} />
        <span className="sr-only">Chargement de la création de compte</span>
      </div>
    </VisitorFlowPage>
  );
}
