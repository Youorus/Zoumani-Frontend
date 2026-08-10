import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = {
  primary: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/92",
  secondary: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/88",
  outline: "border border-border bg-background text-foreground hover:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  danger: "bg-error text-white shadow-soft hover:bg-error/92",
} as const;

const buttonSizes = {
  sm: "h-9 rounded-full px-3 text-sm",
  md: "h-11 rounded-full px-4 text-sm",
  lg: "h-12 rounded-full px-6 text-base",
  icon: "size-11 rounded-full p-0",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  asChild = false,
  className,
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );

  if (asChild) {
    return (
      <Slot className={buttonClassName} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={buttonClassName} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
