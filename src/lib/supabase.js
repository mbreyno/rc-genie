import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase environment variables are not set. ' +
    'Copy .env.example to .env and fill in your Supabase project credentials.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')
