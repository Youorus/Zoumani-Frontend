import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo/site";

export const alt = `${siteConfig.name} — ${siteConfig.shortDescription}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Visuel de partage genere au build.
 * Utilise par Open Graph et Twitter Cards : WhatsApp, Facebook, LinkedIn, X, Slack.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #ff8a38 0%, #ff6b00 55%, #d94f00 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 22,
              background: "#fff8f0",
              color: "#ff6b00",
              fontSize: 46,
              fontWeight: 900,
            }}
          >
            z
          </div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 900,
              color: "#fff8f0",
              letterSpacing: "-0.04em",
            }}
          >
            zoumani
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              color: "#fff8f0",
              maxWidth: 920,
            }}
          >
            Envoyez vos colis avec des voyageurs de confiance
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: "rgba(255, 248, 240, 0.92)",
              maxWidth: 900,
            }}
          >
            {siteConfig.shortDescription}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Voyageurs vérifiés", "Paiement sécurisé", "Suivi en temps réel"].map(
            (label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "14px 26px",
                  borderRadius: 999,
                  background: "rgba(255, 248, 240, 0.16)",
                  border: "2px solid rgba(255, 248, 240, 0.38)",
                  color: "#fff8f0",
                  fontSize: 26,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    size,
  );
}
