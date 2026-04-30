/**
 * Zimbabwe freight geography constants.
 * All coordinates are [latitude, longitude] in WGS-84.
 */

export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
  country: "ZW" | "ZA" | "ZM" | "MZ" | "BW" | "MW";
}

export interface BorderCoord {
  name: string;
  lat: number;
  lng: number;
  countryFrom: string;
  countryTo: string;
}

export interface FreightCorridor {
  id: string;
  label: string;
  cities: [string, string];
  /** Approximate road distance in km */
  distanceKm: number;
  /** Key highway names */
  highway: string;
}

// ─── City coordinates ─────────────────────────────────────────────────────────
export const CITY_COORDS: CityCoord[] = [
  // Zimbabwe
  { name: "Harare",         lat: -17.8252, lng: 31.0335, country: "ZW" },
  { name: "Bulawayo",       lat: -20.1500, lng: 28.5833, country: "ZW" },
  { name: "Mutare",         lat: -18.9707, lng: 32.6709, country: "ZW" },
  { name: "Gweru",          lat: -19.4500, lng: 29.8167, country: "ZW" },
  { name: "Kwekwe",         lat: -18.9281, lng: 29.8143, country: "ZW" },
  { name: "Kadoma",         lat: -18.3333, lng: 29.9167, country: "ZW" },
  { name: "Masvingo",       lat: -20.0667, lng: 30.8333, country: "ZW" },
  { name: "Chinhoyi",       lat: -17.3667, lng: 30.2000, country: "ZW" },
  { name: "Marondera",      lat: -18.1833, lng: 31.5500, country: "ZW" },
  { name: "Beitbridge",     lat: -22.2167, lng: 30.0000, country: "ZW" },
  { name: "Chirundu",       lat: -16.0333, lng: 28.8667, country: "ZW" },
  { name: "Plumtree",       lat: -20.4833, lng: 27.8333, country: "ZW" },
  { name: "Victoria Falls", lat: -17.9333, lng: 25.8333, country: "ZW" },
  { name: "Kariba",         lat: -16.5167, lng: 28.8000, country: "ZW" },
  { name: "Hwange",         lat: -18.3667, lng: 26.5000, country: "ZW" },
  { name: "Bindura",        lat: -17.3000, lng: 31.3333, country: "ZW" },
  { name: "Zvishavane",     lat: -20.3333, lng: 30.0333, country: "ZW" },
  { name: "Chiredzi",       lat: -21.0500, lng: 31.6667, country: "ZW" },
  // Cross-border destinations
  { name: "Johannesburg",   lat: -26.2041, lng: 28.0473, country: "ZA" },
  { name: "Pretoria",       lat: -25.7479, lng: 28.2293, country: "ZA" },
  { name: "Lusaka",         lat: -15.4167, lng: 28.2833, country: "ZM" },
  { name: "Maputo",         lat: -25.9667, lng: 32.5833, country: "MZ" },
  { name: "Gaborone",       lat: -24.6581, lng: 25.9122, country: "BW" },
  { name: "Lilongwe",       lat: -13.9626, lng: 33.7741, country: "MW" },
];

// ─── Border crossing coordinates ──────────────────────────────────────────────
export const BORDER_COORDS: BorderCoord[] = [
  { name: "Beitbridge",     lat: -22.2167, lng: 30.0000, countryFrom: "Zimbabwe", countryTo: "South Africa" },
  { name: "Chirundu",       lat: -16.0333, lng: 28.8667, countryFrom: "Zimbabwe", countryTo: "Zambia" },
  { name: "Plumtree",       lat: -20.4833, lng: 27.8333, countryFrom: "Zimbabwe", countryTo: "Botswana" },
  { name: "Forbes",         lat: -18.9833, lng: 32.7500, countryFrom: "Zimbabwe", countryTo: "Mozambique" },
  { name: "Kazungula",      lat: -17.7833, lng: 25.2667, countryFrom: "Zimbabwe", countryTo: "Botswana" },
  { name: "Victoria Falls", lat: -17.9333, lng: 25.8333, countryFrom: "Zimbabwe", countryTo: "Zambia" },
];

// ─── Freight corridors ────────────────────────────────────────────────────────
export const FREIGHT_CORRIDORS: FreightCorridor[] = [
  { id: "hre-bul",   label: "Harare → Bulawayo",       cities: ["Harare", "Bulawayo"],       distanceKm: 440,  highway: "A5" },
  { id: "hre-beit",  label: "Harare → Beitbridge",     cities: ["Harare", "Beitbridge"],     distanceKm: 580,  highway: "A4" },
  { id: "bul-beit",  label: "Bulawayo → Beitbridge",   cities: ["Bulawayo", "Beitbridge"],   distanceKm: 322,  highway: "A6" },
  { id: "hre-mut",   label: "Harare → Mutare",         cities: ["Harare", "Mutare"],         distanceKm: 265,  highway: "A3" },
  { id: "hre-kwe",   label: "Harare → Kwekwe",         cities: ["Harare", "Kwekwe"],         distanceKm: 215,  highway: "A5" },
  { id: "hre-chi",   label: "Harare → Chirundu",       cities: ["Harare", "Chirundu"],       distanceKm: 345,  highway: "A1" },
  { id: "beit-jnb",  label: "Beitbridge → JNB",        cities: ["Beitbridge", "Johannesburg"], distanceKm: 560, highway: "N1" },
  { id: "hre-lsk",   label: "Harare → Lusaka",         cities: ["Harare", "Lusaka"],         distanceKm: 690,  highway: "A1" },
  { id: "hre-bla",   label: "Harare → Blantyre",       cities: ["Harare", "Lilongwe"],       distanceKm: 1100, highway: "A3/M1" },
  { id: "bul-plm",   label: "Bulawayo → Plumtree",     cities: ["Bulawayo", "Plumtree"],     distanceKm: 100,  highway: "A6" },
  { id: "hre-msv",   label: "Harare → Masvingo",       cities: ["Harare", "Masvingo"],       distanceKm: 292,  highway: "A4" },
  { id: "bul-vf",    label: "Bulawayo → Victoria Falls", cities: ["Bulawayo", "Victoria Falls"], distanceKm: 440, highway: "A8" },
];

/** Look up coordinates for a city by name (case-insensitive). */
export function getCityCoords(name: string): CityCoord | undefined {
  const lower = name.toLowerCase().trim();
  return CITY_COORDS.find((c) => c.name.toLowerCase() === lower);
}

/** Get the wait-time colour class based on hours. */
export function borderWaitColor(waitHours: number): string {
  if (waitHours <= 1)  return "#22c55e"; // green
  if (waitHours <= 3)  return "#f59e0b"; // amber
  if (waitHours <= 6)  return "#f97316"; // orange
  return "#ef4444";                       // red
}

/** Human-readable wait label. */
export function borderWaitLabel(waitHours: number): string {
  if (waitHours < 1) return `${Math.round(waitHours * 60)}min`;
  return `${waitHours.toFixed(1)}h`;
}

/** Zimbabwe map bounds [SW, NE] */
export const ZIM_BOUNDS: [[number, number], [number, number]] = [
  [-22.5, 25.2],
  [-15.5, 33.1],
];

/** Default map center (Zimbabwe centroid) */
export const ZIM_CENTER: [number, number] = [-19.0, 29.15];
