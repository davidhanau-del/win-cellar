import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

const STORAGE_KEY = 'cave_last_login'

export function Login() {
  const signIn = useAuthStore((s) => s.signIn)
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setLogin(saved)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn(login, password)
    if (result.ok) {
      localStorage.setItem(STORAGE_KEY, login)
      navigate('/')
    } else {
      setError(result.error || 'Login ou mot de passe incorrect.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cave-bg flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cave-wine/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cave-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cave-wine items-center justify-center mb-4 shadow-gold">
            <span className="text-3xl">🍷</span>
          </div>
          <h1 className="text-2xl font-bold text-cave-cream">Ma Vinothèque</h1>
          <p className="text-sm text-cave-muted mt-1">Connectez-vous à votre cave privée</p>
        </div>

        {/* Card */}
        <div className="bg-cave-surface border border-cave-border rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-cave-muted uppercase tracking-wider">Login</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                className="input mt-1.5"
                placeholder="votre prénom"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-cave-muted uppercase tracking-wider">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input mt-1.5"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cave-wine hover:bg-cave-wine-light text-cave-cream py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
