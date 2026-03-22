import { useState } from 'react'
import { useWineStore } from '../../stores/wine.store'
import { useCellarStore } from '../../stores/cellar.store'
import { X, ScanLine, Loader2 } from 'lucide-react'
import type { WineColor } from '../../types/wine.types'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

interface Props {
  onClose: () => void
  wine?: any
}

export function WineFormModal({ onClose, wine }: Props) {
  const addWine = useWineStore((s) => s.addWine)
  const updateWine = useWineStore((s) => s.updateWine)
  const adjustCellar = useCellarStore((s) => s.adjust)
  const fetchCellar = useCellarStore((s) => s.fetch)
  const isEditing = !!wine?.id
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [form, setForm] = useState({
    name:           wine?.name || '',
    domain:         wine?.domain || '',
    region:         wine?.region || '',
    country:        wine?.country || 'France',
    color:          (wine?.color || 'red') as WineColor,
    vintage:        wine?.vintage ? String(wine.vintage) : '',
    grape_varieties: wine?.grape_varieties?.join(', ') || '',
    price_paid:     wine?.price_paid ? String(wine.price_paid) : '',
    notes_general:  wine?.notes_general || '',
    quantity:       '1',
  })

  const setField = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleScan = async () => {
    if (!isElectron) return
    setScanning(true)
    setError(null)
    setScanSuccess(false)
    const result = await window.electronAPI.invoke('label:scan')
    setScanning(false)
    if (!result.ok) {
      setError(`Erreur scan : ${result.error}`)
      return
    }
    if (!result.data) return // cancelled
    const d = result.data as any
    setForm((f) => ({
      ...f,
      name:            d.name            || f.name,
      domain:          d.domain          || f.domain,
      region:          d.region          || f.region,
      country:         d.country         || f.country,
      color:           d.color           || f.color,
      vintage:         d.vintage         ? String(d.vintage) : f.vintage,
      grape_varieties: d.grape_varieties?.length ? d.grape_varieties.join(', ') : f.grape_varieties,
      price_paid:      d.price_paid      ? String(d.price_paid) : f.price_paid,
      notes_general:   d.notes_general   || f.notes_general,
    }))
    setScanSuccess(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const payload: any = {
      name: form.name,
      region: form.region,
      country: form.country,
      color: form.color,
    }
    if (form.domain)          payload.domain          = form.domain
    if (form.vintage)         payload.vintage         = parseInt(form.vintage)
    if (form.grape_varieties) payload.grape_varieties = form.grape_varieties.split(',').map((s) => s.trim()).filter(Boolean)
    if (form.price_paid)      payload.price_paid      = parseFloat(form.price_paid)
    if (form.notes_general)   payload.notes_general   = form.notes_general

    if (isEditing) {
      await updateWine(wine.id, payload)
      setLoading(false)
      onClose()
    } else {
      const created = await addWine(payload)
      if (!created) {
        setError('Erreur lors de la création du vin.')
        setLoading(false)
        return
      }
      if (parseInt(form.quantity) > 0) {
        await adjustCellar(null, created.id, parseInt(form.quantity))
        await fetchCellar()
      }
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cave-surface border border-cave-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cave-border">
          <h2 className="font-semibold text-cave-cream">{isEditing ? 'Modifier le vin' : 'Ajouter un vin'}</h2>
          <div className="flex items-center gap-2">
            {!isEditing && isElectron && (
              <button
                type="button"
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cave-gold/40 text-cave-gold hover:bg-cave-gold/10 transition-colors text-xs font-medium disabled:opacity-50"
              >
                {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
                {scanning ? 'Analyse...' : 'Scanner l\'étiquette'}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded hover:bg-cave-elevated text-cave-muted hover:text-cave-cream transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Nom *">
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} required className="input" placeholder="Château Pétrus" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domaine">
              <input value={form.domain} onChange={(e) => setField('domain', e.target.value)} className="input" placeholder="Domaine Leroy..." />
            </Field>
            <Field label="Millésime">
              <input type="number" min="1900" max="2030" value={form.vintage} onChange={(e) => setField('vintage', e.target.value)} className="input" placeholder="2018" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Région *">
              <input value={form.region} onChange={(e) => setField('region', e.target.value)} required className="input" placeholder="Bordeaux" />
            </Field>
            <Field label="Pays">
              <input value={form.country} onChange={(e) => setField('country', e.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Couleur *">
            <select value={form.color} onChange={(e) => setField('color', e.target.value)} className="input">
              <option value="red">Rouge</option>
              <option value="white">Blanc</option>
              <option value="rosé">Rosé</option>
              <option value="sparkling">Effervescent</option>
              <option value="dessert">Liquoreux</option>
              <option value="fortified">Fortifié</option>
            </select>
          </Field>
          <Field label="Cépages (séparés par virgule)">
            <input value={form.grape_varieties} onChange={(e) => setField('grape_varieties', e.target.value)} placeholder="Pinot Noir, Chardonnay..." className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix payé (€)">
              <input type="number" step="0.01" value={form.price_paid} onChange={(e) => setField('price_paid', e.target.value)} className="input" placeholder="45.00" />
            </Field>
            {!isEditing && (
              <Field label="Quantité en cave">
                <input type="number" min="0" value={form.quantity} onChange={(e) => setField('quantity', e.target.value)} className="input" />
              </Field>
            )}
          </div>
          <Field label="Notes">
            <textarea value={form.notes_general} onChange={(e) => setField('notes_general', e.target.value)} rows={3} className="input resize-none" placeholder="Notes générales..." />
          </Field>

          {scanSuccess && (
            <div className="bg-cave-gold/10 border border-cave-gold/30 rounded-lg px-3 py-2">
              <p className="text-sm text-cave-gold">✓ Étiquette analysée — vérifiez les informations avant d'enregistrer.</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-800/40 rounded-lg px-3 py-2">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-cave-wine hover:bg-cave-wine-light text-cave-cream rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-cave-muted uppercase tracking-wider">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
