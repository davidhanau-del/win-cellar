import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AuthStore {
  session: any | null
  isLoading: boolean
  setSession: (session: any | null) => void
  signIn: (login: string, password: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,

  setSession: (session) => set({ session }),

  signIn: async (login, password) => {
    const email = login.includes('@') ? login : `${login.toLowerCase().trim()}@cave.local`
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    set({ session: data.session })
    return { ok: true }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null })
  },

  checkSession: async () => {
    set({ isLoading: true })
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, isLoading: false })
  },
}))
