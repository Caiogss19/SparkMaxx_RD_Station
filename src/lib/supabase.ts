import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rximtawdguljuwiektgx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aW10YXdkZ3VsanV3aWVrdGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDMyOTYsImV4cCI6MjA5NDIxOTI5Nn0.fNOPxWliYxJEKiYen-cNAYafEK0KA2gFjGjTNxLLzG8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
