"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="py-10">
      <ErrorState
        title="Une erreur inattendue est survenue"
        description={error.message || "Le shell applicatif n'a pas pu se charger correctement."}
        action={
          <Button type="button" onClick={reset}>
            Réessayer
          </Button>
        }
      />
    </Container>
  );
}
