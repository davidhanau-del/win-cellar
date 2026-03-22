import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://ddtignulnqfhkessmtll.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdGlnbnVsbnFmaGtlc3NtdGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzI1MjYsImV4cCI6MjA4OTc0ODUyNn0._SV9MmTy8bLvF3pbHjOY3dDacSt0-v2U1ItyhaVwghg'

export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist/web'),
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
  },
})
