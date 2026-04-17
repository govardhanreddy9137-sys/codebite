import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

import { AuthProvider } from './context/AuthContext'
import { FoodProvider } from './context/FoodContext'
import { CartProvider } from './context/CartContext'
import { GroupOrderProvider } from './context/GroupOrderContext'
import { ToastProvider } from './context/ToastContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <FoodProvider>
              <GroupOrderProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </GroupOrderProvider>
            </FoodProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
