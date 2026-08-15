import type { ComponentProps } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

interface UserAvatarProps extends Omit<ComponentProps<typeof Avatar>, "children"> {
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  imageAlt?: string;
  fallbackClassName?: string;
}

/** L'avatar interne unique : même photo et mêmes initiales dans tout le compte. */
export function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  imageAlt = "",
  className,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  const initials =
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";

  return (
    <Avatar className={className} {...props}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={imageAlt} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn("bg-primary/12 font-black text-primary", fallbackClassName)}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
