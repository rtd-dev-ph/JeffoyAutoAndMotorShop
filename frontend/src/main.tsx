import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
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
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
