import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ddtignulnqfhkessmtll.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdGlnbnVsbnFmaGtlc3NtdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzI1MjYsImV4cCI6MjA4OTc0ODUyNn0._SV9MmTy8bLvF3pbHjOY3dDacSt0-v2U1ItyhaVwghg',
)
