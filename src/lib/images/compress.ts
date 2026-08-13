/**
 * Réduit une image avant de l'envoyer.
 *
 * ═══ Pourquoi côté navigateur ═══
 *
 * Une photo de téléphone pèse aujourd'hui trois à huit mégaoctets. Sur
 * une connexion mobile — celle de la plupart des expéditeurs de ce
 * corridor — l'envoi de douze photos prendrait plusieurs minutes et
 * consommerait un forfait.
 *
 * Compresser après réception ne changerait rien à cela : le coût est
 * dans le **téléversement**, pas dans le stockage. Réduire avant l'envoi
 * divise le poids par vingt et rend l'attente supportable.
 *
 * ═══ Ce qu'on garde, ce qu'on perd ═══
 *
 * Le grand côté est ramené à 1600 pixels : au-delà, rien ne se voit de
 * plus sur un écran ni sur un tirage de constat, et c'est bien pour cela
 * que ces photos existent. La qualité JPEG à 0,8 est le point où
 * l'artefact devient invisible à l'œil tout en divisant le poids par
 * quatre.
 *
 * L'orientation EXIF est appliquée par le navigateur au décodage, puis
 * perdue avec les métadonnées — c'est voulu : elles portent souvent la
 * **géolocalisation** de la prise de vue, qu'on n'a aucune raison de
 * conserver ni de transmettre.
 */

/** Le grand côté après réduction. Au-delà, rien ne se voit de plus. */
export const MAX_DIMENSION = 1600;

/** Le point où l'artefact JPEG devient invisible. */
export const JPEG_QUALITY = 0.8;

/** En deçà, compresser coûterait plus de temps que ça n'en ferait gagner. */
export const SKIP_BELOW_BYTES = 200 * 1024;

export interface CompressedImage {
  file: File;
  /** Poids d'origine, pour dire ce qui a été économisé. */
  originalBytes: number;
}

/**
 * Compresse une image, ou la rend telle quelle si c'est inutile.
 *
 * **Ne lève jamais.** Un format que le navigateur ne sait pas décoder —
 * un HEIC sur un navigateur ancien — rend le fichier d'origine : mieux
 * vaut un envoi lourd qu'un envoi impossible, et le serveur reste juge
 * de ce qu'il accepte.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const originalBytes = file.size;

  if (file.size <= SKIP_BELOW_BYTES) {
    return { file, originalBytes };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = fitWithin(bitmap.width, bitmap.height, MAX_DIMENSION);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return { file, originalBytes };
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
    });

    // Une compression qui alourdit n'a pas eu lieu : cela arrive sur les
    // images déjà optimisées, ou très petites en dimensions.
    if (!blob || blob.size >= file.size) {
      return { file, originalBytes };
    }

    return {
      file: new File([blob], renameToJpeg(file.name), {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
      originalBytes,
    };
  } catch {
    return { file, originalBytes };
  }
}

/** Ramène des dimensions sous un plafond, en gardant les proportions. */
export function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const grandCote = Math.max(width, height);
  if (grandCote <= max) {
    return { width, height };
  }
  const facteur = max / grandCote;
  return {
    width: Math.round(width * facteur),
    height: Math.round(height * facteur),
  };
}

/**
 * Renomme en `.jpg`.
 *
 * Le nom ne sert qu'à l'affichage local : le serveur construit sa propre
 * clé et n'en retient rien (AGENTS.md §6.12). Garder `.heic` sur un JPEG
 * tromperait seulement la personne qui relit sa liste.
 */
function renameToJpeg(name: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "photo";
  return `${base}.jpg`;
}
