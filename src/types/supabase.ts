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
      companies: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          phone: string
          email: string
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          phone: string
          email: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          phone?: string
          email?: string
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          criticality: string
          created_at: string
          updated_at: string
          company_id: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          criticality: string
          created_at?: string
          updated_at?: string
          company_id: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          criticality?: string
          created_at?: string
          updated_at?: string
          company_id?: string
        }
      }
      circuits: {
        Row: {
          id: string
          carrier: string
          type: string
          purpose: string
          status: string
          bandwidth: string
          monthlycost: number
          static_ips: number
          upload_bandwidth: string | null
          contract_start_date: string | null
          contract_term: number | null
          contract_end_date: string | null
          billing: string
          usage_charges: boolean
          installation_cost: number
          notes: string | null
          location_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrier: string
          type: string
          purpose: string
          status: string
          bandwidth: string
          monthlycost: number
          static_ips?: number
          upload_bandwidth?: string | null
          contract_start_date?: string | null
          contract_term?: number | null
          contract_end_date?: string | null
          billing: string
          usage_charges?: boolean
          installation_cost?: number
          notes?: string | null
          location_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrier?: string
          type?: string
          purpose?: string
          status?: string
          bandwidth?: string
          monthlycost?: number
          static_ips?: number
          upload_bandwidth?: string | null
          contract_start_date?: string | null
          contract_term?: number | null
          contract_end_date?: string | null
          billing?: string
          usage_charges?: boolean
          installation_cost?: number
          notes?: string | null
          location_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}