"use client";

import type { ServicePoint } from "../types/trip.types";

interface ServicePointsMapProps {
  points: ServicePoint[];
  center: { latitude: number; longitude: number };
  selected: string | null;
  onSelect: (code: string) => void;
}

/**
 * Une carte des points de dépôt, dessinée sans bibliothèque.
 *
 * ═══ Pourquoi pas une vraie carte ═══
 *
 * Une carte glissante — Leaflet, Mapbox — coûte plusieurs centaines de
 * kilo-octets, un fournisseur de tuiles, et une clé à surveiller. Ce
 * qu'elle apporterait ici tient en une question : « lequel est le plus
 * proche, et dans quelle direction ? »
 *
 * Une projection locale y répond. Sur trois kilomètres, la courbure de
 * la Terre est négligeable : une simple mise à l'échelle des écarts de
 * latitude et de longitude, corrigée du cosinus de la latitude pour que
 * les distances est-ouest ne soient pas étirées, suffit à placer des
 * points justes les uns par rapport aux autres.
 *
 * Le jour où la navigation pas-à-pas deviendra utile, on liera vers
 * l'application de cartes du téléphone — qui la fait mieux, et que la
 * personne a déjà.
 */
export function ServicePointsMap({
  points,
  center,
  selected,
  onSelect,
}: ServicePointsMapProps) {
  if (points.length === 0) {
    return null;
  }

  // Correction de la longitude : à 50° de latitude, un degré est-ouest
  // vaut environ 0,64 degré nord-sud en distance réelle. Sans elle, la
  // carte étire tout horizontalement.
  const cosLat = Math.cos((center.latitude * Math.PI) / 180) || 1;

  const ecarts = points.map((point) => ({
    point,
    dx: (point.longitude - center.longitude) * cosLat,
    dy: point.latitude - center.latitude,
  }));

  const rayon =
    Math.max(...ecarts.flatMap(({ dx, dy }) => [Math.abs(dx), Math.abs(dy)])) || 1e-4;
  // Marge de 15 % pour que les pastilles des bords ne soient pas coupées.
  const echelle = 42 / (rayon * 1.15);

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/40"
      role="img"
      aria-label={`Carte de ${points.length} points de dépôt autour de votre adresse`}
    >
      {/* Repères concentriques : ils donnent l'échelle sans chiffres. */}
      {[0.33, 0.66, 1].map((fraction) => (
        <span
          key={fraction}
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60"
          style={{ width: `${fraction * 84}%`, height: `${fraction * 84}%` }}
        />
      ))}

      {/* L'expéditeur, au centre. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-4 ring-background"
      />

      {ecarts.map(({ point, dx, dy }) => {
        const actif = point.code === selected;
        return (
          <button
            key={point.code}
            type="button"
            onClick={() => onSelect(point.code)}
            aria-pressed={actif}
            title={`${point.name} — ${point.distanceMeters ?? "?"} m`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
              actif
                ? "z-10 size-5 bg-primary ring-4 ring-primary/25"
                : "size-3.5 bg-primary/70 hover:bg-primary"
            }`}
            style={{
              left: `calc(50% + ${dx * echelle}%)`,
              // L'axe des ordonnées est inversé : au nord correspond le
              // haut de l'écran, quand les pourcentages CSS descendent.
              top: `calc(50% - ${dy * echelle}%)`,
            }}
          >
            <span className="sr-only">{point.name}</span>
          </button>
        );
      })}
    </div>
  );
}
