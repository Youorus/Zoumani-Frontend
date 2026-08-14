const DEFAULT_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

/**
 * Le fournisseur cartographique reste interchangeable sans toucher au parcours.
 * Les valeurs par défaut conviennent à un affichage interactif modéré ; en cas de
 * montée en charge, la production peut basculer vers un fournisseur avec SLA.
 */
export const servicePointMapConfig = {
  tileUrl: process.env.NEXT_PUBLIC_MAP_TILE_URL || DEFAULT_TILE_URL,
  attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || DEFAULT_ATTRIBUTION,
};
