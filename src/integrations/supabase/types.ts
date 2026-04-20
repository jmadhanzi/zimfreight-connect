export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          carrier_id: string
          created_at: string
          delivered_at: string | null
          distance_km: number | null
          id: string
          load_id: string
          message: string | null
          paid_at: string | null
          rate_usd: number | null
          status: string
          updated_at: string
        }
        Insert: {
          carrier_id: string
          created_at?: string
          delivered_at?: string | null
          distance_km?: number | null
          id?: string
          load_id: string
          message?: string | null
          paid_at?: string | null
          rate_usd?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          created_at?: string
          delivered_at?: string | null
          distance_km?: number | null
          id?: string
          load_id?: string
          message?: string | null
          paid_at?: string | null
          rate_usd?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      border_status: {
        Row: {
          border_name: string
          country_from: string
          country_to: string
          id: string
          status: string
          updated_at: string
          wait_hours: number
        }
        Insert: {
          border_name: string
          country_from: string
          country_to: string
          id?: string
          status?: string
          updated_at?: string
          wait_hours?: number
        }
        Update: {
          border_name?: string
          country_from?: string
          country_to?: string
          id?: string
          status?: string
          updated_at?: string
          wait_hours?: number
        }
        Relationships: []
      }
      load_views: {
        Row: {
          created_at: string
          id: string
          load_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          load_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          load_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_views_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          commodity_value: number | null
          created_at: string
          delivery_deadline: string | null
          destination: string
          distance_km: number | null
          equipment_required: string | null
          highway: string | null
          id: string
          is_border_crossing: boolean
          is_urgent: boolean
          load_type: string
          notes: string | null
          num_loads: number
          origin: string
          payment_terms: string | null
          pickup_date: string | null
          poster_id: string
          rate_per_km: number | null
          rate_usd: number
          status: Database["public"]["Enums"]["load_status"]
          updated_at: string
          views: number
          weight_tonnes: number | null
          zimra_required: boolean
        }
        Insert: {
          commodity_value?: number | null
          created_at?: string
          delivery_deadline?: string | null
          destination: string
          distance_km?: number | null
          equipment_required?: string | null
          highway?: string | null
          id?: string
          is_border_crossing?: boolean
          is_urgent?: boolean
          load_type: string
          notes?: string | null
          num_loads?: number
          origin: string
          payment_terms?: string | null
          pickup_date?: string | null
          poster_id: string
          rate_per_km?: number | null
          rate_usd: number
          status?: Database["public"]["Enums"]["load_status"]
          updated_at?: string
          views?: number
          weight_tonnes?: number | null
          zimra_required?: boolean
        }
        Update: {
          commodity_value?: number | null
          created_at?: string
          delivery_deadline?: string | null
          destination?: string
          distance_km?: number | null
          equipment_required?: string | null
          highway?: string | null
          id?: string
          is_border_crossing?: boolean
          is_urgent?: boolean
          load_type?: string
          notes?: string | null
          num_loads?: number
          origin?: string
          payment_terms?: string | null
          pickup_date?: string | null
          poster_id?: string
          rate_per_km?: number | null
          rate_usd?: number
          status?: Database["public"]["Enums"]["load_status"]
          updated_at?: string
          views?: number
          weight_tonnes?: number | null
          zimra_required?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          phone_whatsapp: string | null
          rating: number
          role: Database["public"]["Enums"]["user_role"]
          total_loads: number
          updated_at: string
          user_id: string
          verified: boolean
          zimra_registered: boolean
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone_whatsapp?: string | null
          rating?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_loads?: number
          updated_at?: string
          user_id: string
          verified?: boolean
          zimra_registered?: boolean
        }
        Update: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone_whatsapp?: string | null
          rating?: number
          role?: Database["public"]["Enums"]["user_role"]
          total_loads?: number
          updated_at?: string
          user_id?: string
          verified?: boolean
          zimra_registered?: boolean
        }
        Relationships: []
      }
      route_rates: {
        Row: {
          avg_rate_per_km: number
          destination: string
          id: string
          last_updated: string
          origin: string
          weekly_loads: number
        }
        Insert: {
          avg_rate_per_km: number
          destination: string
          id?: string
          last_updated?: string
          origin: string
          weekly_loads?: number
        }
        Update: {
          avg_rate_per_km?: number
          destination?: string
          id?: string
          last_updated?: string
          origin?: string
          weekly_loads?: number
        }
        Relationships: []
      }
      saved_loads: {
        Row: {
          created_at: string
          id: string
          load_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          load_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          load_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_loads_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_routes: {
        Row: {
          created_at: string
          destination: string
          id: string
          origin: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          origin: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          origin?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ecocash_ref: string | null
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ecocash_ref?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ecocash_ref?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      broker_dashboard_stats: {
        Args: { _user_id: string }
        Returns: {
          active_loads: number
          avg_hours_to_fill: number
          bids_received: number
          fill_rate: number
          loads_filled: number
        }[]
      }
      carrier_dashboard_stats: {
        Args: { _user_id: string }
        Returns: {
          avg_rate_per_km: number
          est_revenue: number
          km_driven: number
          loads_booked: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      load_status: "available" | "booked" | "completed" | "expired"
      plan_tier: "free" | "basic" | "pro" | "fleet"
      subscription_status: "active" | "pending" | "cancelled" | "expired"
      user_role: "carrier" | "broker" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      load_status: ["available", "booked", "completed", "expired"],
      plan_tier: ["free", "basic", "pro", "fleet"],
      subscription_status: ["active", "pending", "cancelled", "expired"],
      user_role: ["carrier", "broker", "owner"],
    },
  },
} as const
