/**
 * Injecte un graphe JSON-LD dans le document.
 * Rendu cote serveur pour etre present dans le HTML initial, y compris pour les
 * robots qui n'executent pas JavaScript.
 */
export function JsonLd({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu provient de constantes du code, jamais d'une saisie utilisateur.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
