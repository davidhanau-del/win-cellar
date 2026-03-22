import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-cave-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
