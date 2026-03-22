import { ipcMain } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'

export function registerCellarHandlers() {
  ipcMain.handle('cellar:list', async () => {
    try {
      const { data, error } = await supabase
        .from('cellar_entries')
        .select('*, wine:wines(*)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('cellar:adjust', async (_event, { entryId, wineId, delta, type, notes }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let data: any
      let resolvedEntryId: string

      if (entryId === null) {
        // Nouvelle entrée cellar (ajout d'un vin avec quantité initiale)
        if (delta <= 0) throw new Error('La quantité doit être positive pour une nouvelle entrée')
        const { data: newEntry, error: insertError } = await supabase
          .from('cellar_entries')
          .insert({ wine_id: wineId, quantity: delta, user_id: user.id })
          .select()
          .single()
        if (insertError) throw insertError
        data = newEntry
        resolvedEntryId = newEntry.id
      } else {
        // Mise à jour d'une entrée existante
        const { data: entry, error: fetchError } = await supabase
          .from('cellar_entries')
          .select('quantity')
          .eq('id', entryId)
          .single()
        if (fetchError) throw fetchError

        const newQuantity = entry.quantity + delta
        if (newQuantity < 0) throw new Error('Quantity cannot be negative')

        const { data: updatedEntry, error: updateError } = await supabase
          .from('cellar_entries')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', entryId)
          .select()
          .single()
        if (updateError) throw updateError
        data = updatedEntry
        resolvedEntryId = entryId
      }

      await supabase.from('cellar_transactions').insert({
        cellar_entry_id: resolvedEntryId,
        wine_id: wineId,
        user_id: user.id,
        type: type || (delta > 0 ? 'purchase' : 'consumption'),
        quantity_delta: delta,
        notes,
      })

      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('cellar:history', async (_event, { wineId }) => {
    try {
      const { data, error } = await supabase
        .from('cellar_transactions')
        .select('*')
        .eq('wine_id', wineId)
        .order('transaction_at', { ascending: false })
      if (error) throw error
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
