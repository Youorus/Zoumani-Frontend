export type PartnerCategory = "logistics" | "insurance";

export interface TrustedPartner {
  name: string;
  category: PartnerCategory;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  website: string;
  source: string;
  visualLabel?: string;
}

// Adding or replacing a partner only requires updating this collection and its local SVG.
export const trustedPartners: readonly TrustedPartner[] = [
  {
    name: "La Poste",
    category: "logistics",
    logo: "/images/partners/la-poste.svg",
    logoWidth: 162,
    logoHeight: 24,
    website: "https://www.laposte.fr/",
    source: "https://commons.wikimedia.org/wiki/File:La_Poste_Logo.svg",
  },
  {
    name: "DHL",
    category: "logistics",
    logo: "/images/partners/dhl.svg",
    logoWidth: 176,
    logoHeight: 39,
    website: "https://www.dhl.com/",
    source: "https://commons.wikimedia.org/wiki/File:DHL_Logo.svg",
  },
  {
    name: "Asendia",
    category: "logistics",
    logo: "/images/partners/asendia.svg",
    logoWidth: 240,
    logoHeight: 93,
    website: "https://www.asendia.com/",
    source: "https://commons.wikimedia.org/wiki/File:Asendia_logo.svg",
  },
  {
    name: "Colis Privé",
    category: "logistics",
    logo: "/images/partners/colis-prive.svg",
    logoWidth: 105,
    logoHeight: 136,
    website: "https://colisprive.fr/",
    source: "https://worldvectorlogo.com/logo/colis-prive",
    visualLabel: "colis privé",
  },
  {
    name: "Chronopost",
    category: "logistics",
    logo: "/images/partners/chronopost.svg",
    logoWidth: 503,
    logoHeight: 109,
    website: "https://www.chronopost.fr/",
    source: "https://commons.wikimedia.org/wiki/File:Logo_Chronopost.svg",
  },
  {
    name: "UPS",
    category: "logistics",
    logo: "/images/partners/ups.svg",
    logoWidth: 52,
    logoHeight: 62,
    website: "https://www.ups.com/",
    source:
      "https://commons.wikimedia.org/wiki/File:United_Parcel_Service_logo_2014.svg",
  },
  {
    name: "FedEx",
    category: "logistics",
    logo: "/images/partners/fedex.svg",
    logoWidth: 373,
    logoHeight: 170,
    website: "https://www.fedex.com/",
    source: "https://commons.wikimedia.org/wiki/File:FedEx_Express.svg",
  },
  {
    name: "Mondial Relay",
    category: "logistics",
    logo: "/images/partners/mondial-relay.svg",
    logoWidth: 1710,
    logoHeight: 592,
    website: "https://www.mondialrelay.fr/",
    source:
      "https://fr.wikipedia.org/wiki/Fichier:Logo_Mondial_Relay_-_2022.svg",
  },
  {
    name: "AXA",
    category: "insurance",
    logo: "/images/partners/axa.svg",
    logoWidth: 100,
    logoHeight: 100,
    website: "https://www.axa.com/",
    source: "https://designsystem.axa.com/docs/v1.0/foundations/logo/",
  },
  {
    name: "Allianz",
    category: "insurance",
    logo: "/images/partners/allianz.svg",
    logoWidth: 400,
    logoHeight: 99,
    website: "https://www.allianz.com/",
    source: "https://commons.wikimedia.org/wiki/File:Allianz.svg",
  },
  {
    name: "Chubb",
    category: "insurance",
    logo: "/images/partners/chubb.png",
    logoWidth: 3034,
    logoHeight: 307,
    website: "https://www.chubb.com/",
    source: "https://news.chubb.com/download/CHUBB_Logo_Black_RBG.png",
  },
  {
    name: "Secursus",
    category: "insurance",
    logo: "/images/partners/secursus.svg",
    logoWidth: 260,
    logoHeight: 40,
    website: "https://www.secursus.com/",
    source: "https://www.secursus.com/svg/logo.full.svg",
  },
  {
    name: "Curacel",
    category: "insurance",
    logo: "/images/partners/curacel.svg",
    logoWidth: 107,
    logoHeight: 24,
    website: "https://www.curacel.co/",
    source: "https://www.curacel.co/industry-logistics",
  },
] as const;
