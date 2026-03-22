import { useCellarStore } from '../stores/cellar.store'
import { useWineStore } from '../stores/wine.store'
import { Wine, TrendingUp, MapPin, BookOpen } from 'lucide-react'

export function Dashboard() {
  const totalBottles = useCellarStore((s) => s.totalBottles)
  const totalValue = useCellarStore((s) => s.totalValue)
  const wines = useWineStore((s) => s.wines)
  const regions = [...new Set(wines.map((w) => w.region))].length

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-xs text-cave-muted mt-0.5">Vue d'ensemble de votre cave</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Wine}      label="Bouteilles"        value={totalBottles()} accent="gold" />
          <StatCard icon={TrendingUp} label="Valeur estimée"   value={`${totalValue().toFixed(0)} €`} accent="wine" />
          <StatCard icon={MapPin}    label="Régions"           value={regions} accent="gold" />
          <StatCard icon={BookOpen}  label="Vins référencés"   value={wines.length} accent="wine" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-cave-cream mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-cave-gold rounded-full inline-block" />
              Répartition par couleur
            </h2>
            <ColorBreakdown wines={wines} />
          </div>
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-cave-cream mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-cave-wine rounded-full inline-block" />
              Par millésime
            </h2>
            <VintageBar wines={wines} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: 'gold' | 'wine' }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent === 'gold' ? 'bg-cave-gold/10' : 'bg-cave-wine/20'}`}>
        <Icon className={`w-5 h-5 ${accent === 'gold' ? 'text-cave-gold' : 'text-cave-wine-light'}`} />
      </div>
      <div>
        <p className="text-xs text-cave-muted uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-cave-cream mt-0.5">{value}</p>
      </div>
    </div>
  )
}

const COLOR_CONFIG: Record<string, { label: string; bg: string; bar: string }> = {
  red:       { label: 'Rouge',        bg: 'bg-red-800/30',    bar: 'bg-red-700' },
  white:     { label: 'Blanc',        bg: 'bg-yellow-400/20', bar: 'bg-yellow-400' },
  rosé:      { label: 'Rosé',         bg: 'bg-pink-400/20',   bar: 'bg-pink-400' },
  sparkling: { label: 'Effervescent', bg: 'bg-blue-400/20',   bar: 'bg-blue-400' },
  dessert:   { label: 'Liquoreux',    bg: 'bg-amber-400/20',  bar: 'bg-amber-400' },
  fortified: { label: 'Fortifié',     bg: 'bg-purple-500/20', bar: 'bg-purple-500' },
}

function ColorBreakdown({ wines }: { wines: any[] }) {
  const colors = wines.reduce((acc: Record<string, number>, w) => {
    acc[w.color] = (acc[w.color] || 0) + 1
    return acc
  }, {})
  const total = wines.length || 1

  return (
    <div className="space-y-3">
      {Object.entries(colors).map(([color, count]) => {
        const cfg = COLOR_CONFIG[color] || { label: color, bg: 'bg-cave-subtle/30', bar: 'bg-cave-muted' }
        const pct = Math.round((count / total) * 100)
        return (
          <div key={color}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-cave-muted">{cfg.label}</span>
              <span className="text-xs font-medium text-cave-cream">{count} <span className="text-cave-muted">({pct}%)</span></span>
            </div>
            <div className="h-1.5 bg-cave-elevated rounded-full overflow-hidden">
              <div className={`h-full ${cfg.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
      {wines.length === 0 && <p className="text-xs text-cave-muted">Aucun vin dans la cave</p>}
    </div>
  )
}

function VintageBar({ wines }: { wines: any[] }) {
  const byVintage = wines
    .filter((w) => w.vintage)
    .reduce((acc: Record<number, number>, w) => {
      acc[w.vintage] = (acc[w.vintage] || 0) + 1
      return acc
    }, {})

  const sorted = Object.entries(byVintage).sort(([a], [b]) => Number(a) - Number(b))
  const max = Math.max(...sorted.map(([, v]) => v), 1)

  if (sorted.length === 0) return <p className="text-xs text-cave-muted">Aucun millésime renseigné</p>

  return (
    <div className="flex items-end gap-1 h-28">
      {sorted.map(([vintage, count]) => (
        <div key={vintage} className="flex flex-col items-center flex-1 min-w-0 group cursor-default">
          <div
            className="w-full bg-cave-wine/60 group-hover:bg-cave-gold/70 rounded-t transition-colors"
            style={{ height: `${(count / max) * 88}px` }}
            title={`${vintage} : ${count} vin${count > 1 ? 's' : ''}`}
          />
          <span className="text-xs text-cave-muted mt-1 truncate" style={{ fontSize: '9px' }}>{vintage}</span>
        </div>
      ))}
    </div>
  )
}
