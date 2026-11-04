import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

function App() {
  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  function handleLogout() {
    auth?.logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jeffoy Auto and Motor Shop</h1>
        <nav className="flex gap-4 text-sm items-center">
          <Link to="/">Dashboard</Link>
          <Link to="/pos">POS</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/stock">Stock</Link>
          {auth?.isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="text-muted-foreground">Logout ({auth.user?.username || 'user'})</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App
