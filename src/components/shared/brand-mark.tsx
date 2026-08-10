import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <span className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-soft">
        Z
      </span>
      <div className="leading-none">
        <p className="font-display text-2xl text-foreground">Zoumani</p>
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          Frontend Foundation
        </p>
      </div>
    </div>
  );
}
