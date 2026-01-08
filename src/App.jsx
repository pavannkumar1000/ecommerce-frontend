import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'
import OrderDetail from './pages/OrderDetail'

// Components
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import AdminPanel from './components/AdminPanel'

// Context
import { CartProvider, useCart } from './context/CartContext'

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access')
      setIsAuthenticated(!!token)
      setLoading(false)
    }
    
    checkAuth()
    
    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route Wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuth()
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <CartProvider>
      <Router>
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <div className="container mt-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <Login />
                  </div>
                </div>
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <Signup />
                  </div>
                </div>
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
            
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/orders/:orderId" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            
            {/* Admin Route */}
            <Route path="/admin-panel" element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <ToastNotification />
      </Router>
    </CartProvider>
  )
}

// Toast Notification Component
const ToastNotification = () => {
  const { toast } = useCart()
  return <Toast message={toast.message} type={toast.type} />
}

export default App