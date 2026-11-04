import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { POSPage } from './pages/POSPage.tsx'
import { ReceiptPage } from './pages/ReceiptPage.tsx'
import { ProductsPage } from './pages/ProductsPage.tsx'
import { ProductFormPage } from './pages/ProductFormPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<POSPage />} />
          <Route path="receipt" element={<ReceiptPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
