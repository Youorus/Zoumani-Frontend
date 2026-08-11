import { Spinner } from "@/components/ui/spinner";

/** Attente pendant le chargement du parcours d'accès. */
export default function ConnexionLoading() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <Spinner />
    </div>
  );
}
