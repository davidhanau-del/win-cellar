import { useEffect, useState } from 'react'
import { tastingsApi } from '../api/tastings.api'
import { useWineStore } from '../stores/wine.store'
import type { TastingNote } from '../types/tasting.types'
import { Plus, X, Trash2, Pencil, Star } from 'lucide-react'

export function Tastings() {
  const [notes, setNotes] = useState<TastingNote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<TastingNote | null>(null)
  const wines = useWineStore((s) => s.wines)

  const load = () =>
    tastingsApi.list().then((r) => {
      if (r.ok) setNotes(r.data || [])
      setLoading(false)
    })

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    await tastingsApi.delete(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handleSaved = (note: TastingNote, isNew: boolean) => {
    setNotes((prev) => isNew ? [note, ...prev] : prev.map((n) => n.id === note.id ? note : n))
    setShowForm(false)
    setEditingNote(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-cave-muted text-sm">Chargement...</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes de dégustation</h1>
          <p className="text-xs text-cave-muted mt-0.5">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nouvelle note
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-cave-muted">
            <div className="w-16 h-16 rounded-2xl bg-cave-surface border border-cave-border flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-base font-medium text-cave-cream">Aucune note de dégustation</p>
            <p className="text-sm mt-1">Enregistrez vos impressions de dégustation</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {notes.map((note) => {
              const wine = wines.find((w) => w.id === note.wine_id)
              return (
                <TastingCard
                  key={note.id}
                  note={note}
                  wineName={wine?.name}
                  wineVintage={wine?.vintage}
                  onEdit={() => setEditingNote(note)}
                  onDelete={() => handleDelete(note.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {(showForm || editingNote) && (
        <TastingFormModal
          note={editingNote ?? undefined}
          wines={wines}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditingNote(null) }}
        />
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'text-cave-gold' : score >= 80 ? 'text-green-400' : score >= 70 ? 'text-blue-400' : 'text-cave-muted'
  return (
    <div className={`text-center ${color}`}>
      <p className="text-2xl font-bold leading-none">{score}</p>
      <p className="text-xs opacity-70">/ 100</p>
    </div>
  )
}

function TastingCard({ note, wineName, wineVintage, onEdit, onDelete }: {
  note: TastingNote; wineName?: string; wineVintage?: number; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="card p-4 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {wineName && (
            <p className="font-semibold text-cave-cream">
              {wineName} {wineVintage && <span className="text-cave-muted font-normal text-sm">{wineVintage}</span>}
            </p>
          )}
          <p className="text-xs text-cave-muted mt-0.5">
            {new Date(note.tasted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {note.occasion && <span className="ml-2">· {note.occasion}</span>}
          </p>
        </div>
        <div className="flex items-start gap-3">
          {note.score && <ScoreBadge score={note.score} />}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-cave-elevated text-cave-muted hover:text-cave-gold transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-900/20 text-cave-muted hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {(note.acidity || note.body || note.finish || note.conclusion) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.acidity && <Tag label="Acidité" value={note.acidity} />}
          {note.body && <Tag label="Corps" value={note.body} />}
          {note.finish && <Tag label="Finale" value={note.finish} />}
          {note.conclusion && <Tag label={note.conclusion.replace('_', ' ')} value="" highlight />}
        </div>
      )}

      {note.aromas && note.aromas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.aromas.map((a) => (
            <span key={a} className="text-xs bg-cave-wine/20 text-cave-wine-light border border-cave-wine/20 px-2 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
      )}

      {note.free_text && (
        <p className="mt-3 text-sm text-cave-muted leading-relaxed border-t border-cave-border pt-3">{note.free_text}</p>
      )}
    </div>
  )
}

function Tag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${highlight ? 'bg-cave-gold/10 text-cave-gold border-cave-gold/30' : 'bg-cave-elevated text-cave-muted border-cave-border'}`}>
      {label}{value && ` · ${value}`}
    </span>
  )
}

function TastingFormModal({ note, wines, onSaved, onClose }: {
  note?: TastingNote; wines: any[]; onSaved: (note: TastingNote, isNew: boolean) => void; onClose: () => void
}) {
  const isEditing = !!note?.id
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    wine_id:    note?.wine_id    || '',
    tasted_at:  note?.tasted_at  ? note.tasted_at.split('T')[0] : new Date().toISOString().split('T')[0],
    occasion:   note?.occasion   || '',
    score:      note?.score      ? String(note.score) : '',
    acidity:    note?.acidity    || '',
    body:       note?.body       || '',
    finish:     note?.finish     || '',
    conclusion: note?.conclusion || '',
    aromas:     note?.aromas?.join(', ') || '',
    free_text:  note?.free_text  || '',
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload: any = { wine_id: form.wine_id, tasted_at: form.tasted_at }
    if (form.occasion)   payload.occasion   = form.occasion
    if (form.score)      payload.score      = parseInt(form.score)
    if (form.acidity)    payload.acidity    = form.acidity
    if (form.body)       payload.body       = form.body
    if (form.finish)     payload.finish     = form.finish
    if (form.conclusion) payload.conclusion = form.conclusion
    if (form.aromas)     payload.aromas     = form.aromas.split(',').map((s: string) => s.trim()).filter(Boolean)
    if (form.free_text)  payload.free_text  = form.free_text

    const result = isEditing ? await tastingsApi.update(note.id, payload) : await tastingsApi.create(payload)
    setLoading(false)
    if (result.ok && result.data) onSaved(result.data, !isEditing)
  }

  const SELECT = 'input'
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-cave-surface border border-cave-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cave-border">
          <h2 className="font-semibold text-cave-cream">{isEditing ? 'Modifier la note' : 'Nouvelle note de dégustation'}</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-cave-elevated text-cave-muted hover:text-cave-cream transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Vin *">
            <select value={form.wine_id} onChange={(e) => set('wine_id', e.target.value)} required className={SELECT}>
              <option value="">Sélectionner un vin...</option>
              {wines.map((w) => <option key={w.id} value={w.id}>{w.name}{w.vintage ? ` (${w.vintage})` : ''}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input type="date" value={form.tasted_at} onChange={(e) => set('tasted_at', e.target.value)} required className="input" />
            </Field>
            <Field label="Score (50–100)">
              <input type="number" min="50" max="100" value={form.score} onChange={(e) => set('score', e.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Occasion">
            <input value={form.occasion} onChange={(e) => set('occasion', e.target.value)} placeholder="Dîner, dégustation..." className="input" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'acidity', label: 'Acidité', opts: ['low','medium-','medium','medium+','high'] },
              { key: 'body',    label: 'Corps',   opts: ['light','medium-','medium','medium+','full'] },
              { key: 'finish',  label: 'Finale',  opts: ['short','medium-','medium','medium+','long'] },
            ].map(({ key, label, opts }) => (
              <Field key={key} label={label}>
                <select value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} className="input">
                  <option value="">—</option>
                  {opts.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </Field>
            ))}
          </div>
          <Field label="Conclusion">
            <select value={form.conclusion} onChange={(e) => set('conclusion', e.target.value)} className="input">
              <option value="">—</option>
              {['faulty','poor','acceptable','good','very_good','outstanding'].map((v) => (
                <option key={v} value={v}>{v.replace('_', ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Arômes (séparés par virgule)">
            <input value={form.aromas} onChange={(e) => set('aromas', e.target.value)} placeholder="fruits rouges, épices, vanille..." className="input" />
          </Field>
          <Field label="Notes libres">
            <textarea value={form.free_text} onChange={(e) => set('free_text', e.target.value)} rows={3} className="input resize-none" />
          </Field>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 bg-cave-wine hover:bg-cave-wine-light text-cave-cream rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Enregistrer'}
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
