/**
 * Affiche le montant decimal déjà arrondi par l'API, sans le reconvertir en
 * nombre flottant. Le navigateur ne doit jamais recalculer le total débité.
 */
export function displayMajorAmount(major: string, currency: string): string {
  const negative = major.startsWith("-");
  const unsigned = negative ? major.slice(1) : major;
  const [whole = "0", decimals = "00"] = unsigned.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  const amount = `${negative ? "-" : ""}${grouped},${decimals.padEnd(2, "0").slice(0, 2)}`;

  return `${amount} ${currency === "EUR" ? "€" : currency}`;
}
