import { ipcMain, dialog } from 'electron'
import { supabase } from '../services/supabase.client'
import { serializeError } from '../utils/error-handler'
import * as fs from 'fs/promises'

export function registerCsvHandlers() {
  ipcMain.handle('csv:export-wines', async () => {
    try {
      const { data: wines, error } = await supabase
        .from('wines')
        .select('*, cellar_entries(quantity, location, format)')
      if (error) throw error

      const { filePath } = await dialog.showSaveDialog({
        title: 'Export wines',
        defaultPath: `vinotheque-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{ name: 'CSV', extensions: ['csv'] }],
      })
      if (!filePath) return { ok: true, data: { cancelled: true } }

      const headers = ['name', 'domain', 'region', 'country', 'color', 'vintage', 'grape_varieties', 'price_paid', 'quantity']
      const rows = (wines || []).map((w: any) => [
        w.name, w.domain || '', w.region, w.country, w.color,
        w.vintage || '', (w.grape_varieties || []).join(';'),
        w.price_paid || '',
        (w.cellar_entries || []).reduce((sum: number, e: any) => sum + e.quantity, 0),
      ])

      const csvContent = [headers, ...rows].map(row => row.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
      await fs.writeFile(filePath, csvContent, 'utf-8')

      return { ok: true, data: { path: filePath, count: wines?.length || 0 } }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })

  ipcMain.handle('csv:import-wines', async () => {
    try {
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import wines',
        filters: [{ name: 'CSV', extensions: ['csv'] }],
        properties: ['openFile'],
      })
      if (!filePaths.length) return { ok: true, data: { cancelled: true } }

      const content = await fs.readFile(filePaths[0], 'utf-8')
      const lines = content.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const imported: any[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim())
          const row: Record<string, any> = {}
          headers.forEach((h, idx) => { row[h] = values[idx] || null })

          const wine: any = {
            user_id: session.user.id,
            name: row.name,
            region: row.region || 'Unknown',
            country: row.country || 'France',
            color: row.color || 'red',
          }
          if (row.domain) wine.domain = row.domain
          if (row.vintage) wine.vintage = parseInt(row.vintage)
          if (row.price_paid) wine.price_paid = parseFloat(row.price_paid)
          if (row.grape_varieties) wine.grape_varieties = row.grape_varieties.split(';').filter(Boolean)

          const { data: insertedWine, error: wineError } = await supabase
            .from('wines')
            .insert(wine)
            .select()
            .single()
          if (wineError) throw wineError

          if (row.quantity && parseInt(row.quantity) > 0) {
            await supabase.from('cellar_entries').insert({
              user_id: session.user.id,
              wine_id: insertedWine.id,
              quantity: parseInt(row.quantity),
              format: '750ml',
            })
          }

          imported.push(insertedWine)
        } catch (rowErr) {
          errors.push(`Row ${i}: ${serializeError(rowErr)}`)
        }
      }

      return { ok: true, data: { imported: imported.length, errors } }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
