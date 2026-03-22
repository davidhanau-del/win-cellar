import { ipcMain, dialog } from 'electron'
import { readFileSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import { serializeError } from '../utils/error-handler'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export function registerLabelHandlers() {
  ipcMain.handle('label:scan', async () => {
    try {
      // Open file picker
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Sélectionner une photo d\'étiquette',
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
        properties: ['openFile'],
      })

      if (canceled || filePaths.length === 0) {
        return { ok: true, data: null }
      }

      const imagePath = filePaths[0]
      const imageBuffer = readFileSync(imagePath)
      const base64 = imageBuffer.toString('base64')
      const ext = imagePath.split('.').pop()?.toLowerCase() || 'jpeg'
      const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'

      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `Analyse cette étiquette de vin et extrais les informations suivantes au format JSON strict.
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.

{
  "name": "Nom du vin (château, domaine ou appellation principale)",
  "domain": "Nom du domaine ou château (si différent du nom)",
  "vintage": null ou nombre entier (ex: 2018),
  "region": "Région viticole (ex: Bordeaux, Bourgogne, Champagne...)",
  "country": "Pays (ex: France, Italie...)",
  "color": "red | white | rosé | sparkling | dessert | fortified",
  "grape_varieties": ["cépage1", "cépage2"] ou [],
  "price_paid": null ou nombre décimal,
  "notes_general": "Autres informations utiles sur l'étiquette"
}

Si une information n'est pas visible sur l'étiquette, utilise null ou [] pour les tableaux.`,
              },
            ],
          },
        ],
      })

      const textBlock = response.content.find((b) => b.type === 'text')
      if (!textBlock || textBlock.type !== 'text') throw new Error('Pas de réponse textuelle')

      const raw = textBlock.text.trim()
      // Extract JSON even if wrapped in markdown code block
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Format JSON introuvable dans la réponse')

      const parsed = JSON.parse(jsonMatch[0])
      return { ok: true, data: parsed }
    } catch (err) {
      return { ok: false, error: serializeError(err) }
    }
  })
}
