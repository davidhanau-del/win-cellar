import { supabase } from '../lib/supabase'
import type { Pairing } from '../types/pairing.types'

type IpcResult<T> = { ok: true; data?: T } | { ok: false; error: string }

export const pairingsApi = {
  search: async (query?: string, foodCategory?: string): Promise<IpcResult<Pairing[]>> => {
    let q = supabase.from('wine_food_pairings').select('*').limit(50)
    if (foodCategory) {
      q = q.eq('food_category', foodCategory)
    }
    if (query) {
      q = q.or(`food_name.ilike.%${query}%,wine_style.ilike.%${query}%,food_category.ilike.%${query}%,notes.ilike.%${query}%`)
    }
    q = q.order('match_quality')
    const { data, error } = await q
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Pairing[] }
  },

  byWine: async (wineStyle: string): Promise<IpcResult<Pairing[]>> => {
    const { data, error } = await supabase
      .from('wine_food_pairings')
      .select('*')
      .ilike('wine_style', `%${wineStyle}%`)
      .order('match_quality')
      .limit(20)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Pairing[] }
  },

  create: async (payload: Omit<Pairing, 'id' | 'created_at'>): Promise<IpcResult<Pairing>> => {
    const { data, error } = await supabase
      .from('wine_food_pairings')
      .insert(payload)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as Pairing }
  },
}
