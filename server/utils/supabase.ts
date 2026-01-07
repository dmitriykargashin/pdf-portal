import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

let supabaseAdmin: SupabaseClient | null = null

/**
 * Get Supabase admin client (server-side only, uses service role key)
 * This client bypasses Row Level Security for admin operations
 */
export function useSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseServiceKey = config.supabaseServiceKey

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Key not configured')
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseAdmin
}

/**
 * Get Supabase client for a specific event context
 * Uses the anon key for public operations
 */
export function useSupabaseServer(event: H3Event): SupabaseClient {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key not configured')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
