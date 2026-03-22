import { csvApi } from '../api/csv.api'
import { useAuthStore } from '../stores/auth.store'
import { useState } from 'react'
import { Download, Upload, LogOut } from 'lucide-react'

export function Settings() {
  const signOut = useAuthStore((s) => s.signOut)
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)

  const handleExport = async () => {
    setStatus(null)
    const result = await csvApi.exportWines()
    if (result.ok) {
      const d = result.data as any
      setStatus({ ok: true, msg: d?.cancelled ? 'Export annulé.' : `${d?.count} vins exportés avec succès.` })
    } else {
      setStatus({ ok: false, msg: `Erreur : ${result.error}` })
    }
  }

  const handleImport = async () => {
    setStatus(null)
    const result = await csvApi.importWines()
    if (result.ok) {
      const d = result.data as any
      setStatus({ ok: true, msg: d?.cancelled ? 'Import annulé.' : `${d?.imported} vins importés avec succès.` })
    } else {
      setStatus({ ok: false, msg: `Erreur : ${result.error}` })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-header">
        <h1 className="page-title">Paramètres</h1>
      </div>

      <div className="p-6 max-w-lg space-y-6">
        {/* Import / Export */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-cave-cream mb-1 flex items-center gap-2">
            <span className="w-1 h-4 bg-cave-gold rounded-full inline-block" />
            Import / Export
          </h2>
          <p className="text-xs text-cave-muted mb-4">Sauvegardez ou restaurez votre cave au format CSV.</p>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-3 w-full border border-cave-border bg-cave-elevated rounded-lg px-4 py-3 hover:border-cave-gold transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-cave-gold/10 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-cave-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-cave-cream group-hover:text-cave-gold transition-colors">Exporter ma cave</p>
                <p className="text-xs text-cave-muted">Tous les vins et quantités au format CSV</p>
              </div>
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-3 w-full border border-cave-border bg-cave-elevated rounded-lg px-4 py-3 hover:border-cave-gold transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-cave-gold/10 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4 text-cave-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-cave-cream group-hover:text-cave-gold transition-colors">Importer des vins</p>
                <p className="text-xs text-cave-muted">Format : name, domain, region, country, color, vintage…</p>
              </div>
            </button>
          </div>
          {status && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${status.ok ? 'bg-green-900/30 border border-green-800/40 text-green-400' : 'bg-red-900/30 border border-red-800/40 text-red-400'}`}>
              {status.msg}
            </div>
          )}
        </section>

        {/* Compte */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-cave-cream mb-1 flex items-center gap-2">
            <span className="w-1 h-4 bg-cave-wine rounded-full inline-block" />
            Compte
          </h2>
          <p className="text-xs text-cave-muted mb-4">Gérez votre session.</p>
          <button
            onClick={signOut}
            className="flex items-center gap-3 border border-red-900/50 text-red-400 rounded-lg px-4 py-3 hover:bg-red-900/20 hover:border-red-800 transition-colors text-left w-full group"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Se déconnecter</span>
          </button>
        </section>
      </div>
    </div>
  )
}
