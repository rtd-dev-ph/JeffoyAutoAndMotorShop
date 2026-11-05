import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

const sections = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/pos', label: 'POS', icon: '💰' },
  { to: '/sales', label: 'Sales', icon: '🧾' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/stock', label: 'Stock', icon: '📊' },
  { to: '/reports', label: 'Reports', icon: '📈' },
]

function App() {
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeSection = pathname === '/dashboard' ? '/' : pathname === '/receipt' ? '/pos' : `/${pathname.split('/')[1]}`
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  function toggleTheme() {
    setDarkMode(!darkMode)
  }

  function handleLogout() {
    auth?.logout()
    navigate('/login', { replace: true })
    setMobileMenuOpen(false)
  }

  const user = auth?.user

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between gap-4 bg-card sticky top-0 z-40 shadow-sm">
        <div className="flex shrink-0 flex-col">
          <span className="font-bold text-lg tracking-tight text-primary">JEFFOY</span>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Auto &amp; Motor Shop</span>
        </div>

        <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 text-sm">
          {sections.map(({ to, label, icon }) => (
            <Link key={to} to={to} aria-current={activeSection === to ? 'page' : undefined}
              className="flex min-h-10 items-center gap-1.5 px-2 py-2 rounded-lg whitespace-nowrap text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary aria-[current=page]:font-semibold">
              <span aria-hidden="true">{icon}</span> <span>{label}</span>
            </Link>
          ))}
          <button onClick={toggleTheme} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/80 transition-colors">
            <span>{darkMode ? '☀️' : '🌙'}</span> <span className="hidden lg:inline">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="flex min-h-10 max-w-44 items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span>🚪</span>
              <span className="truncate">Logout ({user?.username || 'user'})</span>
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">
              Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          ref={menuButtonRef}
          onClick={() => setMobileMenuOpen(open => !open)}
          className="xl:hidden flex size-11 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-secondary/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Main navigation"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setMobileMenuOpen(false)
              menuButtonRef.current?.focus()
            }
          }}
          className="xl:hidden border-b bg-card px-4 py-3 space-y-1 shadow-sm">
          {sections.map(({ to, label, icon }) => (
            <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)} aria-current={activeSection === to ? 'page' : undefined}
              className="flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary aria-[current=page]:font-semibold">
              <span aria-hidden="true">{icon}</span> {label}
            </Link>
          ))}
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="w-full flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-left text-muted-foreground hover:bg-secondary hover:text-secondary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span aria-hidden="true">🚪</span> <span className="truncate">Logout ({user?.username || 'user'})</span>
            </button>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground justify-center">
              Login
            </Link>
          )}
        </nav>
      )}

      <main className="min-w-0 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default App
