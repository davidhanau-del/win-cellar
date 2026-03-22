import { ipcMain } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'

export function registerTastingHandlers() {
  ipcMain.handle('tasting:list', async (_event, { wineId } = {}) => {
    try {
      let query = supabase.from('tasting_notes').select('*').order('tasted_at', { ascending: false })
      if (wineId) query = query.eq('wine_id', wineId)
      const { data, error } = await query
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('tasting:create', async (_event, payload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase.from('tasting_notes').insert({ ...payload, user_id: user.id }).select().single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('tasting:update', async (_event, { id, ...payload }) => {
    try {
      const { data, error } = await supabase
        .from('tasting_notes')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('tasting:delete', async (_event, { id }) => {
    try {
      const { error } = await supabase.from('tasting_notes').delete().eq('id', id)
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
