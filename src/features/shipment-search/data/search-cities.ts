export interface SearchCity {
  value: string;
  city: string;
  country: string;
  countryCode: string;
  airport: string;
}

export const searchCities: readonly SearchCity[] = [
  {
    value: "paris",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    airport: "Charles-de-Gaulle · CDG",
  },
  {
    value: "lyon",
    city: "Lyon",
    country: "France",
    countryCode: "FR",
    airport: "Lyon-Saint Exupéry · LYS",
  },
  {
    value: "bruxelles",
    city: "Bruxelles",
    country: "Belgique",
    countryCode: "BE",
    airport: "Brussels Airport · BRU",
  },
  {
    value: "abidjan",
    city: "Abidjan",
    country: "Côte d’Ivoire",
    countryCode: "CI",
    airport: "Félix-Houphouët-Boigny · ABJ",
  },
  {
    value: "dakar",
    city: "Dakar",
    country: "Sénégal",
    countryCode: "SN",
    airport: "Blaise-Diagne · DSS",
  },
  {
    value: "douala",
    city: "Douala",
    country: "Cameroun",
    countryCode: "CM",
    airport: "Aéroport international · DLA",
  },
  {
    value: "bamako",
    city: "Bamako",
    country: "Mali",
    countryCode: "ML",
    airport: "Modibo-Keïta · BKO",
  },
  {
    value: "conakry",
    city: "Conakry",
    country: "Guinée",
    countryCode: "GN",
    airport: "Ahmed-Sékou-Touré · CKY",
  },
  {
    value: "cotonou",
    city: "Cotonou",
    country: "Bénin",
    countryCode: "BJ",
    airport: "Bernardin-Gantin · COO",
  },
  {
    value: "casablanca",
    city: "Casablanca",
    country: "Maroc",
    countryCode: "MA",
    airport: "Mohammed-V · CMN",
  },
  {
    value: "nairobi",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    airport: "Jomo-Kenyatta · NBO",
  },
] as const;

export function getSearchCity(value: string) {
  return searchCities.find((city) => city.value === value);
}

export function formatSearchCity(value: string) {
  const city = getSearchCity(value);
  return city ? `${city.city}, ${city.country}` : value;
}
