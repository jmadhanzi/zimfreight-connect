/**
 * FreightMap — interactive Leaflet map for ZimFreight.
 *
 * Features:
 *  • Load origin/destination pins with route polylines
 *  • Border crossing markers with live wait-time colour coding
 *  • Cluster-style load count badges on city markers
 *  • Click a load pin → opens detail sheet
 *  • Click a border marker → opens border status popup
 *  • Filter panel: show/hide loads, borders, corridors
 */
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Load, BorderStatus } from "@/types";
import {
  CITY_COORDS,
  BORDER_COORDS,
  ZIM_CENTER,
  ZIM_BOUNDS,
  getCityCoords,
  borderWaitColor,
  borderWaitLabel,
} from "@/lib/zimGeo";
import { formatUSD } from "@/lib/utils";

// Fix Leaflet's default icon path issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  loads: Load[];
  borders: BorderStatus[];
  onSelectLoad: (load: Load) => void;
  showLoads: boolean;
  showBorders: boolean;
  showCorridors: boolean;
  filterOrigin: string;
  filterDestination: string;
}

/** Build a circular SVG div-icon for city load clusters */
function cityIcon(count: number, isOrigin: boolean) {
  const color = isOrigin ? "#1e3a8a" : "#d97706";
  const size = count > 10 ? 38 : count > 4 ? 32 : 26;
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:${size > 30 ? 13 : 11}px;font-weight:800;
      font-family:'Manrope',system-ui,sans-serif;
    ">${count}</div>`;
  return L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

/** Build a border crossing marker icon */
function borderIcon(waitHours: number) {
  const color = borderWaitColor(waitHours);
  const html = `
    <div style="
      width:34px;height:34px;
      border-radius:6px;
      background:${color};
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.40);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-size:10px;font-weight:800;
      font-family:'JetBrains Mono',ui-monospace,monospace;
      flex-direction:column;gap:0;
    ">
      <span style="font-size:9px;line-height:1">⏱</span>
      <span style="line-height:1.2">${borderWaitLabel(waitHours)}</span>
    </div>`;
  return L.divIcon({ html, className: "", iconSize: [34, 34], iconAnchor: [17, 17] });
}

/** Build a small dot icon for individual load pins */
function loadDotIcon(isUrgent: boolean, isBorder: boolean) {
  const color = isUrgent ? "#ef4444" : isBorder ? "#3b82f6" : "#1e3a8a";
  const html = `<div style="
    width:10px;height:10px;border-radius:50%;
    background:${color};border:2px solid #fff;
    box-shadow:0 1px 4px rgba(0,0,0,0.4);
  "></div>`;
  return L.divIcon({ html, className: "", iconSize: [10, 10], iconAnchor: [5, 5] });
}

export function FreightMap({
  loads,
  borders,
  onSelectLoad,
  showLoads,
  showBorders,
  showCorridors,
  filterOrigin,
  filterDestination,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layerGroups = useRef<{
    loads: L.LayerGroup;
    borders: L.LayerGroup;
    corridors: L.LayerGroup;
    routes: L.LayerGroup;
  } | null>(null);

  // ── Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: ZIM_CENTER,
      zoom: 6,
      minZoom: 5,
      maxZoom: 15,
      zoomControl: true,
    });

    // Dark-style OpenStreetMap tiles (Carto Dark Matter — free, no key)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    // Fit to Zimbabwe bounds
    map.fitBounds(ZIM_BOUNDS, { padding: [20, 20] });

    // Create layer groups
    const loads = L.layerGroup().addTo(map);
    const borders = L.layerGroup().addTo(map);
    const corridors = L.layerGroup().addTo(map);
    const routes = L.layerGroup().addTo(map);

    layerGroups.current = { loads, borders, corridors, routes };
    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
      layerGroups.current = null;
    };
  }, []);

  // ── Draw corridor polylines ──────────────────────────────────────────────
  useEffect(() => {
    const lg = layerGroups.current;
    if (!lg) return;
    lg.corridors.clearLayers();
    if (!showCorridors) return;

    CITY_COORDS.filter((c) => c.country === "ZW").forEach((city) => {
      // Draw a subtle dot for every Zimbabwe city
      L.circleMarker([city.lat, city.lng], {
        radius: 3,
        color: "#ffffff",
        fillColor: "#ffffff",
        fillOpacity: 0.25,
        weight: 1,
        opacity: 0.4,
      })
        .bindTooltip(city.name, { permanent: false, direction: "top", className: "zf-tooltip" })
        .addTo(lg.corridors);
    });
  }, [showCorridors]);

  // ── Draw load pins & route lines ─────────────────────────────────────────
  useEffect(() => {
    const lg = layerGroups.current;
    if (!lg) return;
    lg.loads.clearLayers();
    lg.routes.clearLayers();
    if (!showLoads) return;

    // Filter loads
    const filtered = loads.filter((l) => {
      if (filterOrigin && l.origin.toLowerCase() !== filterOrigin.toLowerCase()) return false;
      if (filterDestination && l.destination.toLowerCase() !== filterDestination.toLowerCase()) return false;
      return true;
    });

    // Group loads by origin city for cluster markers
    const originGroups = new Map<string, Load[]>();
    const destGroups = new Map<string, Load[]>();

    filtered.forEach((load) => {
      const og = originGroups.get(load.origin) ?? [];
      og.push(load);
      originGroups.set(load.origin, og);

      const dg = destGroups.get(load.destination) ?? [];
      dg.push(load);
      destGroups.set(load.destination, dg);
    });

    // Draw route polylines first (below markers)
    filtered.forEach((load) => {
      const oCoord = getCityCoords(load.origin);
      const dCoord = getCityCoords(load.destination);
      if (!oCoord || !dCoord) return;

      const color = load.is_urgent ? "#ef4444" : load.is_border_crossing ? "#3b82f6" : "#d97706";
      const line = L.polyline(
        [
          [oCoord.lat, oCoord.lng],
          [dCoord.lat, dCoord.lng],
        ],
        {
          color,
          weight: load.is_urgent ? 2.5 : 1.5,
          opacity: 0.55,
          dashArray: load.is_border_crossing ? "6 4" : undefined,
        }
      );

      line.on("click", () => onSelectLoad(load));
      line.bindTooltip(
        `<div style="font-family:'Manrope',sans-serif;font-size:12px;font-weight:700">
          ${load.origin} → ${load.destination}<br/>
          <span style="color:#d97706">${formatUSD(load.rate_usd)}</span>
          ${load.distance_km ? ` · ${load.distance_km}km` : ""}
        </div>`,
        { sticky: true, className: "zf-tooltip" }
      );
      line.addTo(lg.routes);
    });

    // Draw origin cluster markers
    originGroups.forEach((groupLoads, cityName) => {
      const coord = getCityCoords(cityName);
      if (!coord) return;

      const marker = L.marker([coord.lat, coord.lng], {
        icon: cityIcon(groupLoads.length, true),
        zIndexOffset: 100,
      });

      const popupHtml = buildCityPopup(cityName, groupLoads, "origin");
      marker.bindPopup(popupHtml, { maxWidth: 280, className: "zf-popup" });

      // Clicking a single-load city opens detail directly
      if (groupLoads.length === 1) {
        marker.on("click", () => onSelectLoad(groupLoads[0]));
      }

      marker.addTo(lg.loads);
    });

    // Draw destination cluster markers (smaller, amber)
    destGroups.forEach((groupLoads, cityName) => {
      // Skip if already drawn as origin
      if (originGroups.has(cityName)) return;
      const coord = getCityCoords(cityName);
      if (!coord) return;

      const marker = L.marker([coord.lat, coord.lng], {
        icon: cityIcon(groupLoads.length, false),
        zIndexOffset: 50,
      });

      const popupHtml = buildCityPopup(cityName, groupLoads, "destination");
      marker.bindPopup(popupHtml, { maxWidth: 280, className: "zf-popup" });
      marker.addTo(lg.loads);
    });
  }, [loads, showLoads, filterOrigin, filterDestination, onSelectLoad]);

  // ── Draw border crossing markers ─────────────────────────────────────────
  useEffect(() => {
    const lg = layerGroups.current;
    if (!lg) return;
    lg.borders.clearLayers();
    if (!showBorders) return;

    borders.forEach((border) => {
      // Prefer DB coordinates (from migration), fall back to static lookup
      const staticCoord = BORDER_COORDS.find(
        (b) => b.name.toLowerCase() === border.border_name.toLowerCase()
      );
      const lat = border.lat != null ? Number(border.lat) : staticCoord?.lat;
      const lng = border.lng != null ? Number(border.lng) : staticCoord?.lng;
      const coord = lat != null && lng != null ? { lat, lng } : staticCoord;
      if (!coord) return;

      const marker = L.marker([coord.lat, coord.lng], {
        icon: borderIcon(Number(border.wait_hours)),
        zIndexOffset: 200,
      });

      const statusColor = borderWaitColor(Number(border.wait_hours));
      const popupHtml = `
        <div style="font-family:'Manrope',sans-serif;min-width:200px">
          <div style="font-size:14px;font-weight:800;margin-bottom:6px">
            🛂 ${border.border_name}
          </div>
          <div style="font-size:11px;color:#888;margin-bottom:8px">
            ${border.country_from} → ${border.country_to}
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="
              background:${statusColor};
              color:#fff;
              padding:3px 10px;
              border-radius:999px;
              font-size:12px;
              font-weight:700;
            ">
              ⏱ ${borderWaitLabel(Number(border.wait_hours))} wait
            </div>
            <span style="
              font-size:11px;font-weight:600;text-transform:uppercase;
              color:${statusColor};
            ">${border.status}</span>
          </div>
          <div style="font-size:10px;color:#666;margin-top:4px">
            Updated: ${new Date(border.updated_at).toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>`;

      marker.bindPopup(popupHtml, { maxWidth: 260, className: "zf-popup" });
      marker.addTo(lg.borders);
    });
  }, [borders, showBorders]);

  // ── Layer visibility toggles ─────────────────────────────────────────────
  useEffect(() => {
    const map = leafletMap.current;
    const lg = layerGroups.current;
    if (!map || !lg) return;
    if (showLoads) { if (!map.hasLayer(lg.loads)) map.addLayer(lg.loads); if (!map.hasLayer(lg.routes)) map.addLayer(lg.routes); }
    else { map.removeLayer(lg.loads); map.removeLayer(lg.routes); }
  }, [showLoads]);

  useEffect(() => {
    const map = leafletMap.current;
    const lg = layerGroups.current;
    if (!map || !lg) return;
    if (showBorders) { if (!map.hasLayer(lg.borders)) map.addLayer(lg.borders); }
    else map.removeLayer(lg.borders);
  }, [showBorders]);

  useEffect(() => {
    const map = leafletMap.current;
    const lg = layerGroups.current;
    if (!map || !lg) return;
    if (showCorridors) { if (!map.hasLayer(lg.corridors)) map.addLayer(lg.corridors); }
    else map.removeLayer(lg.corridors);
  }, [showCorridors]);

  return (
    <>
      {/* Leaflet popup / tooltip custom styles injected inline */}
      <style>{`
        .zf-tooltip {
          background: rgba(15,15,25,0.92) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #f0f0f0 !important;
          border-radius: 8px !important;
          font-family: 'Manrope', system-ui, sans-serif !important;
          font-size: 12px !important;
          padding: 6px 10px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
        }
        .zf-tooltip::before { display: none !important; }
        .zf-popup .leaflet-popup-content-wrapper {
          background: #12131e !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          color: #e8e8f0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
          padding: 0 !important;
        }
        .zf-popup .leaflet-popup-content {
          margin: 14px 16px !important;
        }
        .zf-popup .leaflet-popup-tip-container { display: none !important; }
        .zf-popup .leaflet-popup-close-button {
          color: #888 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
        }
        .leaflet-control-zoom a {
          background: #12131e !important;
          color: #e8e8f0 !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
        .leaflet-control-attribution {
          background: rgba(15,15,25,0.75) !important;
          color: #666 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #888 !important; }
      `}</style>
      <div ref={mapRef} className="h-full w-full" />
    </>
  );
}

/** Build HTML for a city popup listing loads */
function buildCityPopup(city: string, loads: Load[], role: "origin" | "destination"): string {
  const roleLabel = role === "origin" ? "Loads from" : "Loads to";
  const items = loads
    .slice(0, 5)
    .map(
      (l) => `
      <div style="
        padding:8px 0;
        border-bottom:1px solid rgba(255,255,255,0.07);
        display:flex;justify-content:space-between;align-items:center;
      ">
        <div>
          <div style="font-size:12px;font-weight:700;color:#e8e8f0">
            ${role === "origin" ? l.destination : l.origin}
          </div>
          <div style="font-size:10px;color:#888;margin-top:1px">
            ${l.load_type}${l.weight_tonnes ? ` · ${l.weight_tonnes}t` : ""}
            ${l.distance_km ? ` · ${l.distance_km}km` : ""}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:13px;font-weight:800;color:#d97706">${formatUSD(l.rate_usd)}</div>
          ${l.is_urgent ? '<div style="font-size:9px;color:#ef4444;font-weight:700">URGENT</div>' : ""}
        </div>
      </div>`
    )
    .join("");

  const more = loads.length > 5 ? `<div style="font-size:10px;color:#888;margin-top:6px">+${loads.length - 5} more loads</div>` : "";

  return `
    <div style="font-family:'Manrope',sans-serif;min-width:220px">
      <div style="font-size:13px;font-weight:800;color:#e8e8f0;margin-bottom:4px">
        📍 ${city}
      </div>
      <div style="font-size:10px;color:#888;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">
        ${roleLabel} ${city} · ${loads.length} load${loads.length !== 1 ? "s" : ""}
      </div>
      ${items}
      ${more}
    </div>`;
}
