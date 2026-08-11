/**
 * @deprecated Le jeton n'est plus manipulé côté navigateur.
 *
 * Il vit dans un cookie `httpOnly` que le serveur ajoute lui-même à chaque
 * appel (ADR-0010). Ce module ne sert plus qu'à ne pas casser un import
 * oublié ; il disparaîtra une fois les derniers appelants migrés.
 */
export async function resolveAccessToken(): Promise<null> {
  return null;
}
