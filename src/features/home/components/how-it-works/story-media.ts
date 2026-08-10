export type StoryMoment = "prepare" | "match" | "journey" | "arrival";

export interface StoryMedium {
  id: StoryMoment;
  image: string;
  side: "left" | "right";
}

export const storyMedia: readonly StoryMedium[] = [
  {
    id: "prepare",
    image: "/images/storytelling/parcel-preparation.webp",
    side: "left",
  },
  {
    id: "match",
    image: "/images/storytelling/traveler-airport.webp",
    side: "right",
  },
  {
    id: "journey",
    image: "/images/storytelling/parcel-journey.webp",
    side: "left",
  },
  {
    id: "arrival",
    image: "/images/storytelling/parcel-arrival.webp",
    side: "right",
  },
] as const;
