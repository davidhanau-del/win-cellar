import { useState } from 'react'
import { useFilteredWines, useWineStore } from '../stores/wine.store'
import { useCellarStore } from '../stores/cellar.store'
import { Search, Plus, Grid, List, Pencil } from 'lucide-react'
import { WineFormModal } from '../components/wine/WineFormModal'

const COLOR_DOT: Record<string, string> = {
  red:       'bg-red-700',
  white:     'bg-yellow-300 border border-yellow-500',
  rosé:      'bg-pink-400',
  sparkling: 'bg-blue-400',
  dessert:   'bg-amber-400',
  fortified: 'bg-purple-500',
}

const COLOR_LABEL: Record<string, string> = {
  red: 'Rouge', white: 'Blanc', rosé: 'Rosé',
  sparkling: 'Effervescent', dessert: 'Liquoreux', fortified: 'Fortifié',
}

export function Cellar() {
  const { filters, setFilters, viewMode, setViewMode } = useWineStore()
  const wines = useFilteredWines()
  const entries = useCellarStore((s) => s.entries)
  const adjust = useCellarStore((s) => s.adjust)
  const [showForm, setShowForm] = useState(false)
  const [editingWine, setEditingWine] = useState<any>(null)

  const getQuantity = (wineId: string) =>
    entries.filter((e) => e.wine_id === wineId).reduce((sum, e) => sum + e.quantity, 0)
  const getEntry = (wineId: string) => entries.find((e) => e.wine_id === wineId)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Ma Cave</h1>
          <p className="text-xs text-cave-muted mt-0.5">{wines.length} référence{wines.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Ajouter un vin
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-cave-border bg-cave-surface flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cave-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un vin..."
            className="input pl-9"
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        <select
          className="input w-auto"
          value={filters.color || ''}
          onChange={(e) => setFilters({ color: e.target.value as any || undefined })}
        >
          <option value="">Toutes couleurs</option>
          <option value="red">Rouge</option>
          <option value="white">Blanc</option>
          <option value="rosé">Rosé</option>
          <option value="sparkling">Effervescent</option>
          <option value="dessert">Liquoreux</option>
          <option value="fortified">Fortifié</option>
        </select>
        <div className="flex border border-cave-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-cave-wine text-cave-cream' : 'text-cave-muted hover:text-cave-cream'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-cave-wine text-cave-cream' : 'text-cave-muted hover:text-cave-cream'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {wines.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-cave-muted">
            <div className="w-16 h-16 rounded-2xl bg-cave-surface border border-cave-border flex items-center justify-center mb-4">
              <span className="text-3xl">🍷</span>
            </div>
            <p className="text-base font-medium text-cave-cream">Votre cave est vide</p>
            <p className="text-sm mt-1">Ajoutez votre premier vin pour commencer</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                quantity={getQuantity(wine.id)}
                onAdjust={(delta) => adjust(getEntry(wine.id)?.id ?? null, wine.id, delta)}
                onEdit={() => setEditingWine(wine)}
              />
            ))}
          </div>
        ) : (
          <WineTable wines={wines} getQuantity={getQuantity} getEntry={getEntry} adjust={adjust} onEdit={setEditingWine} />
        )}
      </div>

      {showForm && <WineFormModal onClose={() => setShowForm(false)} />}
      {editingWine && <WineFormModal wine={editingWine} onClose={() => setEditingWine(null)} />}
    </div>
  )
}

function WineCard({ wine, quantity, onAdjust, onEdit }: { wine: any; quantity: number; onAdjust: (d: number) => void; onEdit: () => void }) {
  return (
    <div className="card p-4 flex flex-col gap-3 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${COLOR_DOT[wine.color] || 'bg-cave-muted'}`} />
          <span className="text-xs text-cave-muted">{COLOR_LABEL[wine.color] || wine.color}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {wine.vintage && <span className="text-xs text-cave-muted">{wine.vintage}</span>}
          <button onClick={onEdit} className="p-1 rounded hover:bg-cave-elevated text-cave-muted hover:text-cave-gold transition-colors">
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-sm text-cave-cream line-clamp-2 leading-snug">{wine.name}</h3>
        {wine.domain && <p className="text-xs text-cave-muted mt-0.5 truncate">{wine.domain}</p>}
        <p className="text-xs text-cave-muted mt-0.5 truncate">{wine.region}</p>
      </div>

      {wine.price_paid && (
        <p className="text-xs text-cave-gold font-medium">{wine.price_paid.toFixed(0)} €</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-cave-border">
        <button
          onClick={() => onAdjust(-1)}
          disabled={quantity === 0}
          className="w-7 h-7 rounded-lg border border-cave-border flex items-center justify-center text-cave-muted hover:border-cave-wine hover:text-cave-wine-light transition-colors disabled:opacity-30"
        >
          −
        </button>
        <span className={`font-bold text-sm ${quantity === 0 ? 'text-cave-muted' : 'text-cave-cream'}`}>{quantity}</span>
        <button
          onClick={() => onAdjust(1)}
          className="w-7 h-7 rounded-lg border border-cave-border flex items-center justify-center text-cave-muted hover:border-cave-gold hover:text-cave-gold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}

function WineTable({ wines, getQuantity, getEntry, adjust, onEdit }: any) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cave-border">
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Vin</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Région</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Couleur</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Millésime</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Prix</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-cave-muted uppercase tracking-wider">Quantité</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {wines.map((wine: any, i: number) => {
            const qty = getQuantity(wine.id)
            const entry = getEntry(wine.id)
            return (
              <tr key={wine.id} className={`border-b border-cave-border hover:bg-cave-elevated transition-colors ${i % 2 === 0 ? '' : 'bg-cave-bg/30'}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-cave-cream">{wine.name}</p>
                  {wine.domain && <p className="text-xs text-cave-muted">{wine.domain}</p>}
                </td>
                <td className="px-4 py-3 text-cave-muted">{wine.region}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${COLOR_DOT[wine.color] || 'bg-cave-muted'}`} />
                    <span className="text-cave-muted text-xs">{COLOR_LABEL[wine.color] || wine.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-cave-muted">{wine.vintage || '—'}</td>
                <td className="px-4 py-3 text-cave-gold text-xs">{wine.price_paid ? `${wine.price_paid} €` : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => adjust(entry?.id ?? null, wine.id, -1)} disabled={qty === 0} className="w-6 h-6 border border-cave-border rounded flex items-center justify-center text-cave-muted hover:border-cave-wine hover:text-cave-wine-light transition-colors disabled:opacity-30">−</button>
                    <span className={`w-5 text-center font-medium ${qty === 0 ? 'text-cave-muted' : 'text-cave-cream'}`}>{qty}</span>
                    <button onClick={() => adjust(entry?.id ?? null, wine.id, 1)} className="w-6 h-6 border border-cave-border rounded flex items-center justify-center text-cave-muted hover:border-cave-gold hover:text-cave-gold transition-colors">+</button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onEdit(wine)} className="p-1 rounded hover:bg-cave-subtle text-cave-muted hover:text-cave-gold transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
