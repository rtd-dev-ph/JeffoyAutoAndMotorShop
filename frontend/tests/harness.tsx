// Test-only entry: production pages, isolated authentication, intercepted APIs.
// This file is not an entry point of the production Vite build.
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '../src/index.css';
import App from '../src/App';
import { AuthContext } from '../src/contexts/AuthContext';
import { DashboardPage } from '../src/pages/DashboardPage';
import { POSPage } from '../src/pages/POSPage';
import { ProductsPage } from '../src/pages/ProductsPage';
import { ProductFormPage } from '../src/pages/ProductFormPage';
import { CategoriesPage } from '../src/pages/CategoriesPage';
import { CategoryFormPage } from '../src/pages/CategoryFormPage';
import { SalesPage } from '../src/pages/SalesPage';
import { SaleDetailPage } from '../src/pages/SaleDetailPage';
import { StockPage } from '../src/pages/StockPage';
import { RestockPage } from '../src/pages/RestockPage';
import { ReportsPage } from '../src/pages/ReportsPage';
import { ReceiptPage } from '../src/pages/ReceiptPage';
import { LoginPage } from '../src/pages/LoginPage';

const params = new URLSearchParams(window.location.search);
const path = params.get('route') || '/';
const state = params.has('state') ? JSON.parse(params.get('state')!) : undefined;

createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={{
    isAuthenticated: true, token: null, user: null,
    login: async () => { throw new Error('Login is not performed by the UI fixture harness.'); },
    logout: () => {},
  }}>
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<App />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<CategoryFormPage />} />
          <Route path="categories/:id" element={<CategoryFormPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/:id" element={<SaleDetailPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="stock/restock" element={<RestockPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="receipt" element={<ReceiptPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>,
);
