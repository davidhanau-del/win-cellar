import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wine, BookOpen, UtensilsCrossed, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/cellar',   icon: Wine,            label: 'Ma Cave' },
  { to: '/tastings', icon: BookOpen,        label: 'Dégustations' },
  { to: '/pairings', icon: UtensilsCrossed, label: 'Accords' },
  { to: '/settings', icon: Settings,        label: 'Paramètres' },
]

export function Sidebar() {
  return (
    <aside className="w-56 flex flex-col bg-cave-surface border-r border-cave-border h-full shrink-0">
      <div className="px-5 py-5 border-b border-cave-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cave-wine flex items-center justify-center">
            <span className="text-sm">🍷</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-cave-cream leading-tight">Ma Vinothèque</p>
            <p className="text-xs text-cave-muted leading-tight">Cave privée</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                isActive
                  ? 'bg-cave-elevated text-cave-gold border border-cave-subtle'
                  : 'text-cave-muted hover:text-cave-cream hover:bg-cave-elevated'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-cave-gold' : 'text-cave-muted group-hover:text-cave-cream')} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-cave-border">
        <p className="text-xs text-cave-muted">v1.0.0</p>
      </div>
    </aside>
  )
}
