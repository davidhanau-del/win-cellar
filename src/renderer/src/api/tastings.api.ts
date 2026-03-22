import { supabase } from '../lib/supabase'
import type { TastingNote } from '../types/tasting.types'

type IpcResult<T> = { ok: true; data?: T } | { ok: false; error: string }

export const tastingsApi = {
  list: async (wineId?: string): Promise<IpcResult<TastingNote[]>> => {
    let query = supabase.from('tasting_notes').select('*').order('tasted_at', { ascending: false })
    if (wineId) query = query.eq('wine_id', wineId)
    const { data, error } = await query
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as TastingNote[] }
  },

  create: async (payload: Omit<TastingNote, 'id' | 'user_id' | 'created_at'>): Promise<IpcResult<TastingNote>> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Non authentifié' }
    const { data, error } = await supabase
      .from('tasting_notes')
      .insert({ ...payload, user_id: user.id })
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as TastingNote }
  },

  update: async (id: string, payload: Partial<TastingNote>): Promise<IpcResult<TastingNote>> => {
    const { data, error } = await supabase
      .from('tasting_notes')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as TastingNote }
  },

  delete: async (id: string): Promise<IpcResult<void>> => {
    const { error } = await supabase.from('tasting_notes').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },
}
