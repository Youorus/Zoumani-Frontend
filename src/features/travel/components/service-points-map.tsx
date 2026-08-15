"use client";

import "leaflet/dist/leaflet.css";

import type { Layer, LayerGroup, Map as LeafletMap } from "leaflet";
import { MapPinned } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { servicePointMapConfig } from "../config/service-point-map";
import type { ServicePoint } from "../types/trip.types";
import styles from "./service-points-map.module.css";

interface ServicePointsMapProps {
  points: ServicePoint[];
  center: { latitude: number; longitude: number };
  selected: ServicePoint | null;
  isVisible: boolean;
  onSelect: (point: ServicePoint) => void;
}

type LeafletModule = typeof import("leaflet");

/** Carte réelle et synchronisée avec la liste, chargée uniquement côté client. */
export function ServicePointsMap({
  points,
  center,
  selected,
  isVisible,
  onSelect,
}: ServicePointsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const senderLayerRef = useRef<Layer | null>(null);
  const [leaflet, setLeaflet] = useState<LeafletModule | null>(null);
  const [loadFailure, setLoadFailure] = useState(false);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const selectPoint = useEffectEvent((point: ServicePoint) => onSelect(point));

  useEffect(() => {
    let active = true;
    void import("leaflet")
      .then((module) => {
        if (active) {
          setLeaflet(module);
        }
      })
      .catch(() => {
        if (active) {
          setLoadFailure(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!leaflet || !containerRef.current || mapRef.current) {
      return;
    }

    const map = leaflet.map(containerRef.current, {
      attributionControl: true,
      zoomControl: false,
      scrollWheelZoom: true,
    });
    const tiles = leaflet.tileLayer(servicePointMapConfig.tileUrl, {
      attribution: servicePointMapConfig.attribution,
      maxZoom: 19,
    });
    tiles.on("tileerror", () => setTilesUnavailable(true));
    tiles.on("load", () => setTilesUnavailable(false));
    tiles.addTo(map);
    leaflet.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = leaflet.layerGroup().addTo(map);
    map.setView([center.latitude, center.longitude], 13);

    const resizeObserver = new ResizeObserver(() => map.invalidateSize(false));
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      senderLayerRef.current = null;
    };
  }, [leaflet, center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!leaflet || !map || !markerLayer) {
      return;
    }

    markerLayer.clearLayers();
    points.forEach((point, index) => {
      const isSelected =
        selected !== null && servicePointKey(point) === servicePointKey(selected);
      const icon = leaflet.divIcon({
        className: styles.markerHost,
        html: `<span class="${styles.markerPin} ${isSelected ? styles.markerPinSelected : ""}"><span>${isSelected ? "✓" : index + 1}</span></span>`,
        iconAnchor: isSelected ? [19, 38] : [16, 32],
        iconSize: isSelected ? [38, 38] : [32, 32],
      });
      const marker = leaflet.marker([point.latitude, point.longitude], {
        icon,
        keyboard: true,
        riseOnHover: true,
        title: point.name,
      });
      marker.on("click", () => selectPoint(point));
      marker.on("add", () => {
        marker
          .getElement()
          ?.setAttribute("aria-label", `Relais ${index + 1} : ${point.name}`);
      });
      marker.addTo(markerLayer);
    });
  }, [leaflet, points, selected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!leaflet || !map) {
      return;
    }

    if (senderLayerRef.current) {
      senderLayerRef.current.removeFrom(map);
    }
    const senderIcon = leaflet.divIcon({
      className: styles.senderHost,
      html: `<span class="${styles.senderDot}"></span>`,
      iconAnchor: [9, 9],
      iconSize: [18, 18],
    });
    senderLayerRef.current = leaflet
      .marker([center.latitude, center.longitude], {
        icon: senderIcon,
        keyboard: false,
        interactive: false,
      })
      .addTo(map);

    const bounds = leaflet.latLngBounds([
      [center.latitude, center.longitude],
      ...points.map((point) => [point.latitude, point.longitude] as [number, number]),
    ]);
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 15 });
  }, [leaflet, points, center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) {
      return;
    }
    const target: [number, number] = [selected.latitude, selected.longitude];
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      map.panTo(target);
    } else {
      map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.45 });
    }
  }, [selected]);

  useEffect(() => {
    if (!isVisible || !mapRef.current) {
      return;
    }
    const frame = window.requestAnimationFrame(() =>
      mapRef.current?.invalidateSize(false),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [isVisible]);

  return (
    <div className={styles.shell}>
      <div
        ref={containerRef}
        className={styles.map}
        role="region"
        aria-label={`Carte de ${points.length} points relais autour de votre adresse`}
      />
      {!leaflet && !loadFailure && (
        <div className={styles.loading} role="status">
          <div className={styles.loadingCard}>
            <MapPinned className="mx-auto size-5 text-primary" aria-hidden />
            <p className="mt-2 text-sm font-bold text-foreground">La carte arrive…</p>
            <p className="mt-1 text-xs">
              Nous plaçons les relais autour de votre adresse.
            </p>
            <div className={styles.loadingBar} aria-hidden />
          </div>
        </div>
      )}
      {(loadFailure || tilesUnavailable) && (
        <div className={styles.error} role="status">
          <div className={styles.loadingCard}>
            <p className="text-sm font-bold text-foreground">
              Fond de carte indisponible
            </p>
            <p className="mt-1 text-xs">
              La liste, les distances et la sélection restent entièrement disponibles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function servicePointKey(point: ServicePoint) {
  return `${point.carrier}:${point.code}`;
}
