import { ipcMain } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'

export function registerAuthHandlers() {
  ipcMain.handle('auth:sign-in', async (_event, { email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { ok: true, data: data.session }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('auth:sign-out', async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('auth:session', async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { ok: true, data: data.session }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
