import { supabase } from '../lib/supabase'
import type { Wine } from '../types/wine.types'

type IpcResult<T> = { ok: true; data?: T } | { ok: false; error: string }

export const winesApi = {
  list: async (): Promise<IpcResult<Wine[]>> => {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .order('name')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Wine[] }
  },

  get: async (id: string): Promise<IpcResult<Wine>> => {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Wine }
  },

  create: async (payload: Omit<Wine, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<IpcResult<Wine>> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Non authentifié' }
    const { data, error } = await supabase
      .from('wines')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Wine }
  },

  update: async (id: string, payload: Partial<Wine>): Promise<IpcResult<Wine>> => {
    const { data, error } = await supabase
      .from('wines')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Wine }
  },

  delete: async (id: string): Promise<IpcResult<void>> => {
    const { error } = await supabase.from('wines').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  search: async (query: string): Promise<IpcResult<Wine[]>> => {
    const { data, error } = await supabase
      .from('wines')
      .select('*')
      .or(`name.ilike.%${query}%,domain.ilike.%${query}%,region.ilike.%${query}%`)
      .order('name')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Wine[] }
  },
}
