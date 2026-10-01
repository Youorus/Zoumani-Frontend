import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo/site";

export const alt = `${siteConfig.name} — ${siteConfig.shortDescription}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Le visuel de partage — ce que Mail, WhatsApp, LinkedIn ou X affichent
 * quand on colle le lien du site.
 *
 * ═══ Il est à l'image de la vitrine ═══
 *
 * Même ébène, même lueur orange, le vrai symbole — les deux personnes
 * qui se tendent la main — et le slogan tel qu'il est écrit en haut de
 * la page. Avant, l'image portait un « z » dans un carré, un mot-logo en
 * minuscules et une accroche que la page n'affichait nulle part : le
 * lien partagé ne ressemblait pas au site qu'il ouvrait.
 *
 * ═══ Les polices ═══
 *
 * Satori ne lit pas les polices du navigateur : on lui donne les
 * fichiers. Bricolage Grotesque en statique 700 et 800 (OFL, depuis le
 * dépôt de la fonderie), Manrope en 500 et 600. Lus sur disque au
 * build — la route est statique, le rendu n'a lieu qu'une fois.
 *
 * ═══ Les couleurs sont écrites en clair ═══
 *
 * C'est la seule exception à la règle du site : l'image est produite
 * hors du navigateur, où aucune variable CSS n'est résolue. Les valeurs
 * sont celles de `tokens.css`, recopiées.
 */

const EBENE = "#1d0f07";
const EBENE_CLAIR = "#2b1609";
const CREME = "#fffaf5";
const CREME_ATTENUE = "rgba(255, 250, 245, 0.72)";
const ORANGE = "#ff6b00";
const SOLEIL = "#ffc837";

async function police(nom: string): Promise<ArrayBuffer> {
  const octets = await readFile(path.join(process.cwd(), "src/lib/og/fonts", nom));
  return octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength);
}

export default async function OpengraphImage() {
  const [bricolage700, bricolage800, manrope500, manrope600, symbole] = await Promise.all([
    police("bricolage-700.ttf"),
    police("bricolage-800.ttf"),
    police("manrope-500.woff"),
    police("manrope-600.woff"),
    readFile(path.join(process.cwd(), "public/images/zoumani-symbole.png")),
  ]);
  const symboleSrc = `data:image/png;base64,${symbole.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${EBENE} 0%, ${EBENE_CLAIR} 100%)`,
        color: CREME,
        fontFamily: "Manrope",
      }}
    >
      {/* La lueur orange, en bas à gauche, comme sur le hero. */}
      <div
        style={{
          position: "absolute",
          left: -260,
          bottom: -420,
          width: 900,
          height: 900,
          borderRadius: 9999,
          background: `radial-gradient(circle, rgba(255, 107, 0, 0.55) 0%, rgba(255, 107, 0, 0) 62%)`,
        }}
      />
      {/* Une seconde, soleil, en haut à droite. */}
      <div
        style={{
          position: "absolute",
          right: -220,
          top: -300,
          width: 700,
          height: 700,
          borderRadius: 9999,
          background: `radial-gradient(circle, rgba(255, 200, 55, 0.22) 0%, rgba(255, 200, 55, 0) 62%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "56px 72px 48px",
        }}
      >
        {/* Le verrou de marque : symbole et mot. */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={symboleSrc} alt="" width={100} height={62} style={{ display: "flex" }} />
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage Grotesque",
              fontSize: 50,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: CREME,
            }}
          >
            Zoumani
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginLeft: "auto",
              padding: "12px 22px 12px 16px",
              borderRadius: 9999,
              border: "1.5px solid rgba(255, 250, 245, 0.22)",
              background: "rgba(74, 39, 17, 0.6)",
              fontSize: 22,
              fontWeight: 600,
              color: CREME,
            }}
          >
            <div
              style={{ display: "flex", width: 12, height: 12, borderRadius: 9999, background: SOLEIL }}
            />
            Disponible sur l’App Store
          </div>
        </div>

        {/* Le slogan, tel qu'il est écrit en haut du site. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage Grotesque",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              whiteSpace: "nowrap",
              color: CREME,
            }}
          >
            Envoyez vos colis.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Bricolage Grotesque",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              whiteSpace: "nowrap",
              color: ORANGE,
            }}
          >
            Rentabilisez vos voyages.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              maxWidth: 940,
              fontSize: 27,
              lineHeight: 1.35,
              color: CREME_ATTENUE,
            }}
          >
            Expéditeurs, voyageurs et compagnies de fret entre l’Europe et l’Afrique.
            Identités vérifiées, vol confirmé, argent retenu jusqu’à la remise.
          </div>
        </div>

        {/* Le pied : le domaine, et les trajets qu'on nous demande. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 26,
            borderTop: "1px solid rgba(255, 250, 245, 0.18)",
            fontSize: 24,
            color: CREME_ATTENUE,
          }}
        >
          <div style={{ display: "flex", fontWeight: 600, color: CREME }}>zoumani.fr</div>
          <div style={{ display: "flex", gap: 28 }}>
            {["Paris → Douala", "Paris → Dakar", "Paris → Abidjan"].map((trajet) => (
              <div key={trajet} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{ display: "flex", width: 8, height: 8, borderRadius: 9999, background: ORANGE }}
                />
                {trajet}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Bricolage Grotesque", data: bricolage700, weight: 700, style: "normal" },
        { name: "Bricolage Grotesque", data: bricolage800, weight: 800, style: "normal" },
        { name: "Manrope", data: manrope500, weight: 500, style: "normal" },
        { name: "Manrope", data: manrope600, weight: 600, style: "normal" },
      ],
    },
  );
}
