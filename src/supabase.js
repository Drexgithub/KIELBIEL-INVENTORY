import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || 'https://figmduwnzupzfypwhlfo.supabase.co/rest/v1/')
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/$/, '')

const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpZ21kdXduenVwemZ5cHdobGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzI3NzIsImV4cCI6MjEwMDY0ODc3Mn0.PwUWeXPVdQdX6nV2R4Hiaf7UFh8DkwpJuDxwXgMkFPk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
