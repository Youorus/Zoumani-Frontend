import { Star } from "lucide-react";
import Image from "next/image";

import type { HomeContent } from "./home-content";

const avatars = [1, 2, 3, 4] as const;

export function SocialProof({ copy }: { copy: HomeContent["socialProof"] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex -space-x-2.5" aria-label={copy.communityLabel}>
        {avatars.map((avatar) => (
          <Image
            key={avatar}
            src={`/images/home/avatar-${avatar}.webp`}
            width={44}
            height={44}
            alt=""
            className="size-10 rounded-full border-2 border-inverse-foreground object-cover sm:size-11"
          />
        ))}
      </div>
      <div className="space-y-1 text-xs text-inverse-foreground">
        <p className="font-medium">{copy.users}</p>
        <div className="flex items-center gap-1.5">
          <span className="flex text-rating" aria-label={copy.ratingLabel}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-3.5 fill-current" aria-hidden="true" />
            ))}
          </span>
          <span>4.8/5</span>
        </div>
      </div>
    </div>
  );
}
