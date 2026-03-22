import { ipcMain } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'
import { z } from 'zod'

const WineSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1),
  country: z.string().default('France'),
  color: z.enum(['red', 'white', 'rosé', 'sparkling', 'dessert', 'fortified']),
  domain: z.string().optional(),
  sub_region: z.string().optional(),
  appellation: z.string().optional(),
  grape_varieties: z.array(z.string()).optional(),
  vintage: z.number().int().optional(),
  price_paid: z.number().optional(),
  estimated_value: z.number().optional(),
  supplier: z.string().optional(),
  notes_general: z.string().optional(),
  peak_from: z.number().int().optional(),
  peak_until: z.number().int().optional(),
})

export function registerWineHandlers() {
  ipcMain.handle('wine:list', async () => {
    try {
      const { data, error } = await supabase.from('wines').select('*').order('name')
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('wine:get', async (_event, { id }) => {
    try {
      const { data, error } = await supabase.from('wines').select('*').eq('id', id).single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('wine:create', async (_event, payload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const validated = WineSchema.parse(payload)
      const { data, error } = await supabase.from('wines').insert({ ...validated, user_id: user.id }).select().single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('wine:update', async (_event, { id, ...payload }) => {
    try {
      const validated = WineSchema.partial().parse(payload)
      const { data, error } = await supabase
        .from('wines')
        .update({ ...validated, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('wine:delete', async (_event, { id }) => {
    try {
      const { error } = await supabase.from('wines').delete().eq('id', id)
      if (error) throw error
      return { ok: true }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('wine:search', async (_event, { query }) => {
    try {
      const { data, error } = await supabase
        .from('wines')
        .select('*')
        .or(`name.ilike.%${query}%,domain.ilike.%${query}%,region.ilike.%${query}%`)
        .order('name')
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
