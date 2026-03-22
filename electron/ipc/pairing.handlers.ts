import { ipcMain } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'

export function registerPairingHandlers() {
  ipcMain.handle('pairing:search', async (_event, { query, foodCategory }) => {
    try {
      let q = supabase.from('pairings').select('*')
      if (query) {
        q = q.or(
          `food_name.ilike.%${query}%,wine_style.ilike.%${query}%,food_category.ilike.%${query}%,notes.ilike.%${query}%`
        )
      }
      if (foodCategory) q = q.eq('food_category', foodCategory)
      const { data, error } = await q.order('match_quality').limit(50)
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('pairing:by-wine', async (_event, { wineStyle }) => {
    try {
      const { data, error } = await supabase
        .from('pairings')
        .select('*')
        .eq('wine_style', wineStyle)
        .order('match_quality')
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('pairing:create', async (_event, payload) => {
    try {
      const { data, error } = await supabase.from('pairings').insert(payload).select().single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
