import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { POSPage } from './pages/POSPage.tsx'
import { ReceiptPage } from './pages/ReceiptPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<POSPage />} />
          <Route path="receipt" element={<ReceiptPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
