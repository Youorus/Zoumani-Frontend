import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div className={cn("panel-surface border-error/20 bg-error/5 p-6", className)}>
      <div className="space-y-2">
        <h3 className="font-display text-2xl text-foreground">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
