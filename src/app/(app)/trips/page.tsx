import { redirect } from "next/navigation";

/*
 * `/trips` n'a pas de contenu propre : la liste des voyages vit dans
 * l'espace du compte, avec le reste de ce qui appartient à la personne.
 * Deux pages listant la même chose finiraient par diverger.
 */
export default function Page() {
  redirect("/compte/trajets");
}
