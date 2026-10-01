/**
 * Les coordonnées des villes sur la carte en points.
 *
 * La carte elle-même est `public/images/carte-europe-afrique.svg` : les
 * terres d'Europe et d'Afrique de Natural Earth (110 m, domaine public),
 * projetées en Mercator sur un cadre de 820 × 1000, un point tous les 11,5 px.
 * Les villes ci-dessous sont projetées avec la même formule : si le cadre
 * change, les deux se régénèrent ensemble. Ne pas éditer à la main.
 */
export const MAP_WIDTH = 820;
export const MAP_HEIGHT = 1000;
/** La hauteur affichée : le cadre s'arrête sous Luanda, le sud du continent n'a pas de ville dessinée. */
export const MAP_CROP_HEIGHT = 830;

export const CITIES = {
  paris: [
    283.5,
    212.6
  ],
  bruxelles: [
    303.5,
    187
  ],
  lyon: [
    308.4,
    250.6
  ],
  marseille: [
    313.7,
    279.3
  ],
  geneve: [
    321.4,
    245.3
  ],
  londres: [
    258.7,
    178.3
  ],
  lisbonne: [
    168.6,
    329.7
  ],
  madrid: [
    223,
    311.4
  ],
  milan: [
    351.9,
    254.2
  ],
  rome: [
    385,
    295.1
  ],
  dakar: [
    85.5,
    555.7
  ],
  bamako: [
    180,
    573.1
  ],
  abidjan: [
    220,
    634.6
  ],
  accra: [
    258.1,
    632.5
  ],
  lagos: [
    293.8,
    624.8
  ],
  douala: [
    357,
    645.4
  ],
  kinshasa: [
    413,
    715
  ],
  casablanca: [
    184,
    382.7
  ],
  alger: [
    290.6,
    350.4
  ],
  tunis: [
    361.8,
    349.9
  ],
  nairobi: [
    628.2,
    689.8
  ],
  antananarivo: [
    735,
    839
  ],
  luanda: [
    392.3,
    752.8
  ],
  conakry: [
    123,
    599.8
  ]
} as const;

export type CityId = keyof typeof CITIES;
