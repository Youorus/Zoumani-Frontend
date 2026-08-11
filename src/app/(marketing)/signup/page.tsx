import { redirect } from "next/navigation";

/**
 * Ancienne page d'inscription — redirigée vers la porte unique.
 *
 * ═══ Pourquoi elle ne fait plus que rediriger ═══
 *
 * Le backend n'a **qu'un** parcours d'accès : on saisit son adresse, et le
 * serveur décide s'il s'agit d'une connexion ou d'une création. Maintenir
 * ici un second formulaire produirait deux portes qui divergeraient à la
 * première évolution — et l'une des deux finirait par ne plus fonctionner.
 *
 * Trois choses que l'ancien formulaire demandait n'existent plus côté
 * serveur, et c'est pourquoi il ne pouvait pas rester :
 *
 * - **un choix « expéditeur ou voyageur »** — le rôle n'est pas un attribut
 *   de la personne mais une position dans une transaction (AGENTS.md §9).
 *   La même personne expédie lundi et voyage jeudi, avec le même compte ;
 * - **un mot de passe** — le parcours n'en demande jamais : deux preuves de
 *   possession suffisent, et il n'y a rien à mémoriser ni à perdre ;
 * - **une création en un seul envoi** — l'adresse et le téléphone sont
 *   prouvés *avant* que le compte existe, pas après.
 *
 * Les paramètres de recherche sont conservés : quelqu'un qui vient d'un
 * résultat doit y revenir après s'être connecté.
 */
type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    // `role` est délibérément écarté : il n'a pas d'équivalent côté
    // serveur, et le transporter entretiendrait l'idée qu'il en a un.
    if (single && key !== "role") {
      query.set(key, single);
    }
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  redirect(`/connexion${suffix}`);
}
