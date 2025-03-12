export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      personal_info: {
        Row: {
          id: string
          user_id: string
          name: string | null
          age: string | null
          stream: string | null
          gender: string | null
          email: string | null
          contact_no: string | null
          next_phone: string | null
          country: string | null
          district: string | null
          state: string | null
          village: string | null
          parent_name: string | null
          relation: string | null
          occupation: string | null
          posting_date: string | null
          updation_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          email?: string | null
          age?: string | null
          stream?: string | null
          gender?: string | null
          contact_no?: string | null
          next_phone?: string | null
          country?: string | null
          district?: string | null
          state?: string | null
          village?: string | null
          parent_name?: string | null
          relation?: string | null
          occupation?: string | null
          posting_date?: string | null
          updation_date?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          email?: string | null
          age?: string | null
          stream?: string | null
          gender?: string | null
          contact_no?: string | null
          next_phone?: string | null
          country?: string | null
          district?: string | null
          state?: string | null
          village?: string | null
          parent_name?: string | null
          relation?: string | null
          occupation?: string | null
          posting_date?: string | null
          updation_date?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      education: {
        Row: {
          id: string
          user_id: string
          degree: string | null
          field: string | null
          institution: string | null
          start_year: string | null
          end_year: string | null
          gpa: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          degree?: string | null
          field?: string | null
          institution?: string | null
          start_year?: string | null
          end_year?: string | null
          gpa?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          degree?: string | null
          field?: string | null
          institution?: string | null
          start_year?: string | null
          end_year?: string | null
          gpa?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          upload_date: string
          file_size: string | null
          file_type: string | null
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          upload_date?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          upload_date?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          user_id: string
          record_type: string | null
          description: string | null
          date: string | null
          institution: string | null
          doctor: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          record_type?: string | null
          description?: string | null
          date?: string | null
          institution?: string | null
          doctor?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          record_type?: string | null
          description?: string | null
          date?: string | null
          institution?: string | null
          doctor?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employment: {
        Row: {
          id: string
          user_id: string
          company: string | null
          position: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company?: string | null
          position?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string | null
          position?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          make: string | null
          model: string | null
          year: string | null
          registration_number: string | null
          insurance_expiry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          make?: string | null
          model?: string | null
          year?: string | null
          registration_number?: string | null
          insurance_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          make?: string | null
          model?: string | null
          year?: string | null
          registration_number?: string | null
          insurance_expiry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
