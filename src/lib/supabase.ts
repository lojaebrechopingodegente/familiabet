import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = 'https://dxftwkrfxrymofwrtdhj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZnR3a3JmeHJ5bW9md3J0ZGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDAwMDAsImV4cCI6MjA2ODg3NjAwMH0.DUMMY_KEY_FOR_DEVELOPMENT'

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
