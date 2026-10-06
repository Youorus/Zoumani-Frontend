# Photographies du Hero Zoumani

Photographies sous [licence Pexels](https://www.pexels.com/license/), vérifiée
le 6 octobre 2026 : utilisation gratuite sur un site et dans des campagnes
commerciales, recadrage autorisé, attribution appréciée mais non obligatoire.
Les images restent protégées par cette licence ; « libres de droits » ne
signifie pas domaine public. Les personnes photographiées illustrent le lien
humain, sans être présentées comme clientes ou comme recommandant Zoumani.

## Catalogue intégré

| Fichier | Thème | Auteur | Source |
|---|---|---|---|
| `zoumani-sourire-pagne.webp` | Le plaisir de retrouver un sourire | hashtag-melvin | [Pexels 36039096](https://www.pexels.com/photo/36039096/) |
| `zoumani-trois-generations.webp` | Le lien entre générations | macd | [Pexels 38405256](https://www.pexels.com/photo/38405256/) |
| `zoumani-plaisir-colis.webp` | Le sourire à l’ouverture d’un colis | Mikhail Nilov | [Pexels 6969689](https://www.pexels.com/photo/6969689/) |
| `zoumani-lien-video.webp` | Partager un moment malgré la distance | Askar Abayev | [Pexels 6193635](https://www.pexels.com/photo/6193635/) |

La liste exécutable, les textes alternatifs FR/EN et le délai de rotation sont
dans `src/features/home/model/hero-photos.ts`. Les crédits des nouvelles
photos reprennent la présélection déjà documentée dans ce dépôt. Les fichiers
ont été téléchargés depuis le CDN officiel `images.pexels.com` le 6 octobre
2026 ; aucune image générée ni retouche des personnes n’a été ajoutée.

## Préparation

Le portrait initial est conservé : original 4160 × 6240, WebP qualité 84,
1200 × 1800. Pour les nouvelles images, téléchargement à 1600 px de large,
recadrage local puis WebP qualité 83 ; aucun agrandissement.

| Fichier | Recadrage dans le JPEG téléchargé | Export | Taille |
|---|---|---|---|
| `zoumani-trois-generations.webp` | 1600 × 1600, origine (0, 0) | 1200 × 1200 | 145 728 octets |
| `zoumani-plaisir-colis.webp` | 1600 × 1600, origine (0, 0) | 1200 × 1200 | 56 316 octets |
| `zoumani-lien-video.webp` | 1068 × 1068, origine (280, 0) | 1068 × 1068 | 146 942 octets |

Les trois ajouts représentent environ 341 Kio avant optimisation par
`next/image`. Les JPEG temporaires ne sont pas versionnés. Le catalogue
visuel est dans `docs/HERO-PHOTOS.md`.

## Autres candidates non intégrées

| Ce qu’elle montre | Auteur | Source | Choix |
|---|---|---|---|
| Portrait devant un mur ocre | tkirkgoz | [Pexels 11459125](https://www.pexels.com/photo/11459125/) | Moins de contexte sur le lien ou les colis. |
| Ouverture d’une boîte, second angle | Mikhail Nilov | [Pexels 6970008](https://www.pexels.com/photo/6970008/) | Le sourire est plus net dans l’angle retenu. |

Pas de coursier générique, de logo d’organisation identifiable, de faux
partenariat ou de témoignage attribué aux personnes photographiées.
