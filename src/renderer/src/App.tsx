import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/auth.store'
import { useWineStore } from './stores/wine.store'
import { useCellarStore } from './stores/cellar.store'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Cellar } from './pages/Cellar'
import { Tastings } from './pages/Tastings'
import { Pairings } from './pages/Pairings'
import { Settings } from './pages/Settings'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function DataLoader({ children }: { children: React.ReactNode }) {
  const fetchWines = useWineStore((s) => s.fetch)
  const fetchCellar = useCellarStore((s) => s.fetch)

  useEffect(() => {
    fetchWines()
    fetchCellar()
  }, [])

  return <>{children}</>
}

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGate>
              <DataLoader>
                <AppShell />
              </DataLoader>
            </AuthGate>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="cellar" element={<Cellar />} />
          <Route path="tastings" element={<Tastings />} />
          <Route path="pairings" element={<Pairings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
