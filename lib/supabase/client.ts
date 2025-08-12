import { createClient } from "@supabase/supabase-js"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Types for our database
export interface Assessment {
  id: string
  created_at: string
  updated_at: string
  flow_type: "individual" | "team"
  status: "in_progress" | "completed"
  age_range?: string
  gender?: string
  years_experience?: string
  industry?: string
  role_level?: string
  qualitative_responses?: string[]
  ranking_data?: Array<{
    motivator: string
    rank: number
  }>
  team_name?: string
  team_size?: number
  team_members?: Array<{
    name: string
    role: string
  }>
}
