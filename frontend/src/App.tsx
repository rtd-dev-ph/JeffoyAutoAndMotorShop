import { Outlet, Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jeffoy Auto and Motor Shop</h1>
        <nav className="flex gap-4 text-sm">
          <Link to="/">POS</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/stock">Stock</Link>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
