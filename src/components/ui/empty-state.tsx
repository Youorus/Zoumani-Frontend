import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("panel-surface flex flex-col items-start gap-4 p-6", className)}>
      <div className="space-y-2">
        <h3 className="font-display text-2xl text-foreground">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
