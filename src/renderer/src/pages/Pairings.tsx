import { useEffect, useState } from 'react'
import { pairingsApi } from '../api/pairings.api'
import type { Pairing } from '../types/pairing.types'
import { Search } from 'lucide-react'

const QUALITY_CONFIG: Record<string, { label: string; classes: string }> = {
  classic:    { label: 'Classique',   classes: 'bg-cave-gold/15 text-cave-gold border border-cave-gold/30' },
  good:       { label: 'Bon',         classes: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' },
  acceptable: { label: 'Acceptable',  classes: 'bg-cave-muted/20 text-cave-muted border border-cave-border' },
  avoid:      { label: 'À éviter',    classes: 'bg-red-900/30 text-red-400 border border-red-800/30' },
}

const CATEGORY_LABELS: Record<string, string> = {
  viandes_rouges:    'Viandes rouges',
  viandes_blanches:  'Viandes blanches',
  poissons:          'Poissons',
  fruits_de_mer:     'Fruits de mer',
  fromages:          'Fromages',
  charcuterie:       'Charcuterie',
  cuisine_italienne: 'Cuisine italienne',
  cuisine_espagnole: 'Cuisine espagnole',
  cuisine_asiatique: 'Cuisine asiatique',
  cuisine_francaise: 'Cuisine française',
  vegetarien:        'Végétarien',
  desserts:          'Desserts',
}

export function Pairings() {
  const [pairings, setPairings] = useState<Pairing[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      pairingsApi.search(query).then((r) => {
        if (r.ok) setPairings(r.data || [])
        setLoading(false)
      })
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  // Group by category
  const grouped = pairings.reduce((acc: Record<string, Pairing[]>, p) => {
    const cat = p.food_category || 'autres'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <div>
          <h1 className="page-title">Accords mets & vins</h1>
          <p className="text-xs text-cave-muted mt-0.5">{pairings.length} accord{pairings.length !== 1 ? 's' : ''} disponible{pairings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="px-6 py-3 border-b border-cave-border bg-cave-surface">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cave-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Chercher un plat ou un style de vin..."
            className="input pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-cave-muted text-sm">Chargement...</p>
          </div>
        ) : pairings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-cave-muted">
            <p className="text-sm">Aucun accord trouvé pour « {query} »</p>
          </div>
        ) : query ? (
          // Flat list when searching
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {pairings.map((p) => <PairingCard key={p.id} pairing={p} />)}
          </div>
        ) : (
          // Grouped by category when browsing
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-cave-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-px bg-cave-gold/40 inline-block" />
                  {CATEGORY_LABELS[cat] || cat}
                  <span className="text-cave-muted font-normal normal-case tracking-normal">({items.length})</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((p) => <PairingCard key={p.id} pairing={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PairingCard({ pairing: p }: { pairing: Pairing }) {
  const cfg = QUALITY_CONFIG[p.match_quality] || QUALITY_CONFIG.acceptable
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-cave-cream leading-snug">{p.food_name}</p>
        <span className={`badge shrink-0 ${cfg.classes}`}>{cfg.label}</span>
      </div>
      <p className="text-xs text-cave-gold mb-1">{p.wine_style}</p>
      {p.notes && <p className="text-xs text-cave-muted leading-relaxed">{p.notes}</p>}
    </div>
  )
}
