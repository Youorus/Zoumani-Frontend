export const brandThemes = [
  {
    id: "zoumani",
    label: "Zoumani",
    description: "Orange Teranga comme primaire sémantique.",
  },
  {
    id: "zoumani-v2",
    label: "Zoumani V2",
    description: "Même UI, branding alternatif en changeant seulement les tokens.",
  },
] as const;

export type BrandTheme = (typeof brandThemes)[number]["id"];
export type ColorScheme = "light" | "dark" | "system";
