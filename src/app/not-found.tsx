import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <Container className="py-10">
      <EmptyState
        title="Page introuvable"
        description="La route demandée n'existe pas encore dans l'architecture Zoumani."
        action={
          <Button asChild>
            <Link href="/">Revenir au socle</Link>
          </Button>
        }
      />
    </Container>
  );
}
