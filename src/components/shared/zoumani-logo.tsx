import { cn } from "@/lib/utils/cn";

interface ZoumaniLogoProps {
  className?: string;
  inverse?: boolean;
}

export function ZoumaniLogo({ className, inverse = false }: ZoumaniLogoProps) {
  return (
    <span
      className={cn(
        "block font-sans text-[2rem] leading-none font-black tracking-[-0.055em] sm:text-[2.4rem]",
        inverse ? "text-inverse-foreground" : "text-foreground",
        className,
      )}
    >
      zoumani
    </span>
  );
}
