import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

function App() {
  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    auth?.logout()
    navigate('/login', { replace: true })
  }

  const user = auth?.user

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight">JEFFOY</span>
          <span className="text-sm font-medium text-muted-foreground">Auto &amp; Motor Shop</span>
        </div>
        <nav className="flex items-center gap-4 text-sm items-center">
          <Link to="/" className="flex items-center gap-1.5">
            <span>🏠</span> Dashboard
          </Link>
          <Link to="/pos" className="flex items-center gap-1.5">
            <span>💰</span> POS
          </Link>
          <Link to="/sales" className="flex items-center gap-1.5">
            <span>🧾</span> Sales
          </Link>
          <Link to="/products" className="flex items-center gap-1.5">
            <span>📦</span> Products
          </Link>
          <Link to="/categories" className="flex items-center gap-1.5">
            <span>🏷️</span> Categories
          </Link>
          <Link to="/stock" className="flex items-center gap-1.5">
            <span>📊</span> Stock
          </Link>
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <span>🚪</span>
              <span className="hidden sm:inline">Logout ({user?.username || 'user'})</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Login
            </Link>
          )}
        </nav>
      </header>
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default App
