export type UserRole = "carrier" | "broker" | "owner";
export type LoadStatus = "available" | "booked" | "completed" | "expired";
export type PlanTier = "free" | "basic" | "pro" | "fleet";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  company_name: string | null;
  phone_whatsapp: string | null;
  city: string | null;
  role: UserRole;
  zimra_registered: boolean;
  verified: boolean;
  rating: number;
  total_loads: number;
  created_at: string;
}

export interface Load {
  id: string;
  poster_id: string;
  origin: string;
  destination: string;
  highway: string | null;
  distance_km: number | null;
  load_type: string;
  equipment_required: string | null;
  weight_tonnes: number | null;
  num_loads: number;
  rate_usd: number;
  rate_per_km: number | null;
  payment_terms: string | null;
  pickup_date: string | null;
  delivery_deadline: string | null;
  notes: string | null;
  status: LoadStatus;
  is_border_crossing: boolean;
  zimra_required: boolean;
  commodity_value: number | null;
  is_urgent: boolean;
  views: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanTier;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export const PLAN_LEVEL: Record<PlanTier, number> = {
  free: 0,
  basic: 1,
  pro: 2,
  fleet: 3,
};

export const FREE_LOAD_LIMIT = 5;

export interface RouteRate {
  id: string;
  origin: string;
  destination: string;
  avg_rate_per_km: number;
  weekly_loads: number;
  last_updated: string;
}

export interface BorderStatus {
  id: string;
  border_name: string;
  country_from: string;
  country_to: string;
  wait_hours: number;
  status: string;
  updated_at: string;
}

export const ZIM_CITIES = [
  "Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Kadoma",
  "Masvingo", "Chinhoyi", "Marondera", "Beitbridge", "Chirundu",
  "Plumtree", "Victoria Falls", "Kariba", "Hwange", "Bindura",
];

export const CROSS_BORDER_CITIES = [
  "Johannesburg", "Lusaka", "Maputo", "Gaborone", "Lilongwe", "Pretoria",
];

export const ALL_DEST_CITIES = [...ZIM_CITIES, ...CROSS_BORDER_CITIES];

export const PAYMENT_TERMS_OPTIONS = ["COD", "Net 7 days", "Net 14 days", "Net 30 days"];

export type SortKey = "newest" | "rate_high" | "rate_low" | "rate_per_km" | "distance";

export const LOAD_TYPES = [
  "General Cargo", "Containers", "Bulk Grain", "Fuel/Tanker",
  "Refrigerated", "Livestock", "Mining/Ore", "Cement", "Steel",
  "Tobacco", "Cotton", "Vehicles", "Hazardous",
];

export const EQUIPMENT_TYPES = [
  "Flatbed", "Curtain Side", "Box Truck", "Refrigerated", "Tanker",
  "Tipper", "Lowbed", "Container Skel", "Livestock Trailer",
];
