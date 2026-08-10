import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
  return (
    <Container className="space-y-6">
      <Skeleton className="h-36 w-full rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-[1.75rem]" />
        ))}
      </div>
    </Container>
  );
}
