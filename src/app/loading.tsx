import { Container } from "@/components/layout/container";
import { Spinner } from "@/components/ui/spinner";

export default function GlobalLoading() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">Chargement du socle Zoumani...</p>
    </Container>
  );
}
