import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

function App() {
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleLogout() {
    auth?.logout()
    navigate('/login', { replace: true })
    setMobileMenuOpen(false)
  }

  const user = auth?.user

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight">JEFFOY</span>
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Auto &amp; Motor Shop</span>
        </div>

        <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-sm">
          <Link to="/" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>🏠</span> <span>Dashboard</span>
          </Link>
          <Link to="/pos" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>💰</span> <span>POS</span>
          </Link>
          <Link to="/sales" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>🧾</span> <span>Sales</span>
          </Link>
          <Link to="/products" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>📦</span> <span>Products</span>
          </Link>
          <Link to="/categories" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>🏷️</span> <span>Categories</span>
          </Link>
          <Link to="/stock" className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>📊</span> <span>Stock</span>
          </Link>
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
              <span>🚪</span>
              <span className="hidden lg:inline">Logout ({user?.username || 'user'})</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-secondary/80 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <nav className="md:hidden border-b bg-card px-4 py-2 space-y-1 sticky top-[57px] z-40">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>🏠</span> Dashboard
          </Link>
          <Link to="/pos" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>💰</span> POS
          </Link>
          <Link to="/sales" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>🧾</span> Sales
          </Link>
          <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>📦</span> Products
          </Link>
          <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>🏷️</span> Categories
          </Link>
          <Link to="/stock" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/80">
            <span>📊</span> Stock
          </Link>
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
              <span>🚪</span> Logout ({user?.username || 'user'})
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground justify-center">
              Login
            </Link>
          )}
        </nav>
      )}

      <main className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default App
