import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import type { CategoryDto, ProductDto, DailySalesReportDto, HealthResponse } from '@/types/api';
import './App.css';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [report, setReport] = useState<DailySalesReportDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check API health on mount
  useEffect(() => {
    apiClient
      .get<HealthResponse>('/health/database')
      .then(setHealth)
      .catch(() => setHealth({ status: 'error', database: 'disconnected' }));
  }, []);

  // Fetch categories and products
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        apiClient.get<CategoryDto[]>('/api/categories'),
        apiClient.get<ProductDto[]>('/api/products'),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  // Fetch today's daily sales report
  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<DailySalesReportDto>('/api/reports/daily-sales');
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  if (!health) {
    return <div className="app">Checking API health...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Jeffoy Auto and Motor Shop</h1>
        <p className={health.status === 'healthy' ? 'health-good' : 'health-bad'}>
          API: {health.status} | DB: {health.database}
        </p>
      </header>

      <main>
        <section className="card">
          <h2>Products</h2>
          <button onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Load Products and Categories'}
          </button>
          {error && <p className="error">{error}</p>}

          <h3>Categories ({categories.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description || '-'}</td>
                  <td>{c.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Products ({products.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.categoryName || '-'}</td>
                  <td>PHP {p.sellingPrice.toFixed(2)}</td>
                  <td>{p.stockQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Daily Sales Report</h2>
          <button onClick={loadReport} disabled={loading}>
            {loading ? 'Loading...' : 'Load Today Report'}
          </button>

          {report && (
            <div className="report">
              <p><strong>Date:</strong> {report.date}</p>
              <p><strong>Transactions:</strong> {report.transactionCount}</p>
              <p><strong>Items Sold:</strong> {report.totalItemsSold}</p>
              <p><strong>Total Sales:</strong> PHP {report.totalSales.toFixed(2)}</p>
              <p><strong>Cash:</strong> PHP {report.cashTotal.toFixed(2)}</p>
              <p><strong>GCash:</strong> PHP {report.gCashTotal.toFixed(2)}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
