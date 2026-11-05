import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { POSPage } from './pages/POSPage.tsx'
import { ReceiptPage } from './pages/ReceiptPage.tsx'
import { ProductsPage } from './pages/ProductsPage.tsx'
import { ProductFormPage } from './pages/ProductFormPage.tsx'
import { CategoriesPage } from './pages/CategoriesPage.tsx'
import { CategoryFormPage } from './pages/CategoryFormPage.tsx'
import { SalesPage } from './pages/SalesPage.tsx'
import { SaleDetailPage } from './pages/SaleDetailPage.tsx'
import { StockPage } from './pages/StockPage.tsx'
import { RestockPage } from './pages/RestockPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RequireAuth } from './components/RequireAuth.tsx'
import { ReportsPage } from './pages/ReportsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireAuth><App /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="pos" element={<POSPage />} />
            <Route path="receipt" element={<ReceiptPage />} />
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
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
