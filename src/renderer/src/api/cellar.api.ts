import { supabase } from '../lib/supabase'
import type { CellarEntry } from '../types/wine.types'

type IpcResult<T> = { ok: true; data?: T } | { ok: false; error: string }

export const cellarApi = {
  list: async (): Promise<IpcResult<CellarEntry[]>> => {
    const { data, error } = await supabase
      .from('cellar_entries')
      .select('*, wine:wines(*)')
      .order('created_at', { ascending: false })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data as CellarEntry[] }
  },

  adjust: async (
    entryId: string | null,
    wineId: string,
    delta: number,
    type?: string,
    notes?: string,
  ): Promise<IpcResult<CellarEntry>> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Non authentifié' }

    let resolvedEntryId: string
    let entry: CellarEntry

    if (entryId === null) {
      const { data: newEntry, error } = await supabase
        .from('cellar_entries')
        .insert({ wine_id: wineId, quantity: delta, user_id: user.id })
        .select('*, wine:wines(*)')
        .single()
      if (error) return { ok: false, error: error.message }
      resolvedEntryId = newEntry.id
      entry = newEntry as CellarEntry
    } else {
      const { data: existing, error: fetchErr } = await supabase
        .from('cellar_entries')
        .select('quantity')
        .eq('id', entryId)
        .single()
      if (fetchErr) return { ok: false, error: fetchErr.message }

      const newQty = Math.max(0, existing.quantity + delta)
      const { data: updated, error: updateErr } = await supabase
        .from('cellar_entries')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .select('*, wine:wines(*)')
        .single()
      if (updateErr) return { ok: false, error: updateErr.message }
      resolvedEntryId = entryId
      entry = updated as CellarEntry
    }

    await supabase.from('cellar_transactions').insert({
      cellar_entry_id: resolvedEntryId,
      wine_id: wineId,
      user_id: user.id,
      type: type || (delta > 0 ? 'purchase' : 'consumption'),
      quantity_delta: delta,
      notes,
    })

    return { ok: true, data: entry }
  },

  history: async (wineId: string): Promise<IpcResult<unknown[]>> => {
    const { data, error } = await supabase
      .from('cellar_transactions')
      .select('*')
      .eq('wine_id', wineId)
      .order('created_at', { ascending: false })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data }
  },
}
