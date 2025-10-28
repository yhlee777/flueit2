import { createClient } from '@supabase/supabase-js'

// 임시로 하드코딩
const supabaseUrl = "https://oizpbmxrhoksrxqwbwdq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9penBibXhyaG9rc3J4cXdid2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzIxNzcsImV4cCI6MjA3NjkwODE3N30.vDLk_uwklFP0qGvaJxkqQNQ2jLwfRFMFrp9Q4Z-tG8o"
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9penBibXhyaG9rc3J4cXdid2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzMjE3NywiZXhwIjoyMDc2OTA4MTc3fQ.L7iU_hGO7c6ikeZk-eZzRe5o3AOp7mXSbgdKQe8llRA"

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🔐 HARDCODED SERVICE ROLE KEY:')
console.log(supabaseServiceRoleKey)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})