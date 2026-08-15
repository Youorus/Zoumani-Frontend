import Link from "next/link";

export function AdminNav({ current }: { current: "identity" | "travel" }) {
  return (
    <nav
      className="mb-5 flex w-fit rounded-full border border-border bg-surface p-1 shadow-soft"
      aria-label="Domaines d'administration"
    >
      <Link
        href="/admin"
        aria-current={current === "identity" ? "page" : undefined}
        className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition-colors ${
          current === "identity"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        Identités
      </Link>
      <Link
        href="/admin/voyages"
        aria-current={current === "travel" ? "page" : undefined}
        className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition-colors ${
          current === "travel"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        Voyages
      </Link>
    </nav>
  );
}
