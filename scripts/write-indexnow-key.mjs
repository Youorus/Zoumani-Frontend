/**
 * Écrit le fichier de vérification IndexNow avant la construction.
 *
 * Le protocole exige un fichier `{clé}.txt`, contenant la clé, servi à la
 * racine du domaine. Une route Next ne peut pas l'offrir : le segment
 * racine est déjà occupé par `[intention]`, et deux segments dynamiques
 * au même niveau se refusent à la compilation.
 *
 * Le fichier est donc posé dans `public/`, d'où Next le sert tel quel, à
 * la racine. Il n'est pas versionné — c'est la clé — et se régénère à
 * chaque image.
 *
 * Sans `INDEXNOW_KEY`, le script ne fait rien et ne bloque pas la
 * construction : IndexNow est une amélioration, pas une dépendance.
 */
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const key = process.env.INDEXNOW_KEY?.trim();
const dossier = join(process.cwd(), "public");

mkdirSync(dossier, { recursive: true });

// Une ancienne clé laissée en place resterait valide : le protocole
// authentifie par la présence du fichier. On nettoie avant d'écrire.
for (const nom of readdirSync(dossier)) {
  if (/^[A-Za-z0-9-]{8,128}\.txt$/.test(nom) && nom !== `${key}.txt`) {
    unlinkSync(join(dossier, nom));
  }
}

if (!key) {
  console.log("[indexnow] INDEXNOW_KEY absente — aucun fichier de clé écrit.");
  process.exit(0);
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
  console.error(
    "[indexnow] Clé invalide. Le protocole n'accepte que a-z, A-Z, 0-9 et le tiret, de 8 à 128 caractères.",
  );
  process.exit(1);
}

writeFileSync(join(dossier, `${key}.txt`), key, "utf8");
console.log(`[indexnow] public/${key}.txt écrit.`);
