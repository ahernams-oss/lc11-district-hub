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
      clubs: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          division_id: string
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          meetings: string | null
          name: string
          order_index: number
          phone: string | null
          president: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          division_id: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name: string
          order_index?: number
          phone?: string | null
          president?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          division_id?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string
          order_index?: number
          phone?: string | null
          president?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          president_name: string | null
          president_photo_url: string | null
          region_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          president_name?: string | null
          president_photo_url?: string | null
          region_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          president_name?: string | null
          president_photo_url?: string | null
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          document_id: string | null
          document_title: string
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          document_title: string
          id?: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          document_title?: string
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_audit_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          is_restricted: boolean | null
          required_role: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_restricted?: boolean | null
          required_role?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_restricted?: boolean | null
          required_role?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          description: string | null
          environment: string
          id: string
          payment_status: string
          raw_event: Json | null
          receipt_number: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          environment: string
          id?: string
          payment_status: string
          raw_event?: Json | null
          receipt_number: string
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          environment?: string
          id?: string
          payment_status?: string
          raw_event?: Json | null
          receipt_number?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          food_tips: string | null
          gallery_urls: string[]
          host_club: string | null
          id: string
          latitude: number | null
          location: string | null
          lodging_tips: string | null
          longitude: number | null
          organizer: string | null
          place_info: string | null
          starts_at: string | null
          tag: string | null
          title: string
          tourism_tips: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          food_tips?: string | null
          gallery_urls?: string[]
          host_club?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          lodging_tips?: string | null
          longitude?: number | null
          organizer?: string | null
          place_info?: string | null
          starts_at?: string | null
          tag?: string | null
          title: string
          tourism_tips?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          food_tips?: string | null
          gallery_urls?: string[]
          host_club?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          lodging_tips?: string | null
          longitude?: number | null
          organizer?: string | null
          place_info?: string | null
          starts_at?: string | null
          tag?: string | null
          title?: string
          tourism_tips?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leaders: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          email: string | null
          gallery_urls: string[]
          id: string
          message: string | null
          motto: string | null
          name: string
          order_index: number
          phone: string | null
          photo_url: string | null
          pin_url: string | null
          role: string | null
          updated_at: string
          year_label: string | null
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          email?: string | null
          gallery_urls?: string[]
          id?: string
          message?: string | null
          motto?: string | null
          name: string
          order_index?: number
          phone?: string | null
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string
          year_label?: string | null
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          email?: string | null
          gallery_urls?: string[]
          id?: string
          message?: string | null
          motto?: string | null
          name?: string
          order_index?: number
          phone?: string | null
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string
          year_label?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string
          slug: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      popups: {
        Row: {
          active: boolean
          content: string | null
          created_at: string
          display_seconds: number
          end_at: string
          id: string
          image_url: string | null
          link_label: string | null
          link_url: string | null
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string | null
          created_at?: string
          display_seconds?: number
          end_at: string
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string | null
          created_at?: string
          display_seconds?: number
          end_at?: string
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          gallery_urls: string[]
          id: string
          order_index: number
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          id?: string
          order_index?: number
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          id?: string
          order_index?: number
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          letter: string
          name: string
          order_index: number
          president: string | null
          president_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          letter: string
          name: string
          order_index?: number
          president?: string | null
          president_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          letter?: string
          name?: string
          order_index?: number
          president?: string | null
          president_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string | null
          id: string
          path: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          path?: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          path?: string
          visitor_id?: string
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
      clubs_public: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          division_id: string | null
          facebook: string | null
          id: string | null
          instagram: string | null
          logo_url: string | null
          meetings: string | null
          name: string | null
          order_index: number | null
          president: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          division_id?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string | null
          order_index?: number | null
          president?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          division_id?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string | null
          order_index?: number | null
          president?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders_public: {
        Row: {
          bio: string | null
          category: string | null
          created_at: string | null
          email: string | null
          gallery_urls: string[] | null
          id: string | null
          message: string | null
          motto: string | null
          name: string | null
          order_index: number | null
          phone: string | null
          photo_url: string | null
          pin_url: string | null
          role: string | null
          updated_at: string | null
          year_label: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          email?: never
          gallery_urls?: string[] | null
          id?: string | null
          message?: string | null
          motto?: string | null
          name?: string | null
          order_index?: number | null
          phone?: never
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string | null
          year_label?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          email?: never
          gallery_urls?: string[] | null
          id?: string | null
          message?: string | null
          motto?: string | null
          name?: string | null
          order_index?: number | null
          phone?: never
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string | null
          year_label?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_edit_content: { Args: { _user_id: string }; Returns: boolean }
      can_view_users: { Args: { _user_id: string }; Returns: boolean }
      has_panel_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "basico" | "intermediario" | "avancado"
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
      app_role: ["admin", "user", "basico", "intermediario", "avancado"],
    },
  },
} as const
