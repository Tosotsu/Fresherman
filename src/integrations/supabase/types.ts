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
          email: string | null
          phone: string | null
          contact_no: string | null
          next_phone: string | null
          age: string | null
          gender: string | null
          address: string | null
          city: string | null
          district: string | null
          state: string | null
          village: string | null
          postal_code: string | null
          country: string | null
          occupation: string | null
          stream: string | null
          parent_name: string | null
          relation: string | null
          about: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          contact_no?: string | null
          next_phone?: string | null
          age?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          state?: string | null
          village?: string | null
          postal_code?: string | null
          country?: string | null
          occupation?: string | null
          stream?: string | null
          parent_name?: string | null
          relation?: string | null
          about?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          contact_no?: string | null
          next_phone?: string | null
          age?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          district?: string | null
          state?: string | null
          village?: string | null
          postal_code?: string | null
          country?: string | null
          occupation?: string | null
          stream?: string | null
          parent_name?: string | null
          relation?: string | null
          about?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      education: {
        Row: {
          id: string
          user_id: string
          degree: string | null
          field_of_study: string | null
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
          field_of_study?: string | null
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
          field_of_study?: string | null
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
          title: string
          description: string | null
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
          title: string
          description?: string | null
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
          title?: string
          description?: string | null
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
          record_type: string
          date: string
          blood_type: string
          height: string
          weight: string
          allergies: string[]
          emergency_contact: Json
          description: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          record_type: string
          date: string
          blood_type: string
          height: string
          weight: string
          allergies: string[]
          emergency_contact: Json
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          record_type?: string
          date?: string
          blood_type?: string
          height?: string
          weight?: string
          allergies?: string[]
          emergency_contact?: Json
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      employment: {
        Row: {
          id: string
          user_id: string
          company_name: string
          position: string
          start_date: string
          end_date?: string
          is_current_job: boolean
          description: string
          location: string
          salary?: number
          supervisor_name?: string
          supervisor_contact?: string
          responsibilities: string
          achievements?: string
          reason_for_leaving?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          position: string
          start_date: string
          end_date?: string
          is_current_job: boolean
          description: string
          location: string
          salary?: number
          supervisor_name?: string
          supervisor_contact?: string
          responsibilities: string
          achievements?: string
          reason_for_leaving?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          position?: string
          start_date?: string
          end_date?: string
          is_current_job?: boolean
          description?: string
          location?: string
          salary?: number
          supervisor_name?: string
          supervisor_contact?: string
          responsibilities?: string
          achievements?: string
          reason_for_leaving?: string
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
          year: number | null
          color: string | null
          license_plate: string | null
          vin: string | null
          registration_number: string | null
          insurance_provider: string | null
          insurance_policy_number: string | null
          insurance_expiry_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          make?: string | null
          model?: string | null
          year?: number | null
          color?: string | null
          license_plate?: string | null
          vin?: string | null
          registration_number?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          insurance_expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          make?: string | null
          model?: string | null
          year?: number | null
          color?: string | null
          license_plate?: string | null
          vin?: string | null
          registration_number?: string | null
          insurance_provider?: string | null
          insurance_policy_number?: string | null
          insurance_expiry_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          vehicle_id: string
          user_id: string
          date: string | null
          type: string | null
          description: string | null
          mileage: string | null
          cost: string | null
          service_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          user_id: string
          date?: string | null
          type?: string | null
          description?: string | null
          mileage?: string | null
          cost?: string | null
          service_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          user_id?: string
          date?: string | null
          type?: string | null
          description?: string | null
          mileage?: string | null
          cost?: string | null
          service_provider?: string | null
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
