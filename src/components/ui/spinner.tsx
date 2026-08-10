import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-6 border-[2.5px]",
  lg: "size-8 border-[3px]",
} as const;

export function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-spin rounded-full border-current border-r-transparent text-primary",
        sizeClasses[size],
        className,
      )}
    />
  );
}
