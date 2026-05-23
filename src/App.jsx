import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Layouts
import PublicLayout    from './components/shared/PublicLayout'
import SellerLayout    from './components/shared/SellerLayout'
import AdminLayout     from './components/shared/AdminLayout'

// Public pages
import HomePage        from './pages/buyer/HomePage'
import ListingsPage    from './pages/buyer/ListingsPage'
import ListingDetail   from './pages/buyer/ListingDetail'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'

// Seller pages
import SellerDashboard from './pages/seller/Dashboard'
import NewListing      from './pages/seller/NewListing'
import EditListing     from './pages/seller/EditListing'
import MyListings      from './pages/seller/MyListings'
import SellerProfile   from './pages/seller/Profile'

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard'
import AdminListings   from './pages/admin/Listings'
import AdminReview     from './pages/admin/ReviewListing'
import AdminInquiries  from './pages/admin/Inquiries'

// Guards
function RequireAuth({ children, role }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full"/></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm', duration: 4000 }} />
      <Routes>
        {/* ── Public ─────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"                element={<HomePage />} />
          <Route path="/listings"        element={<ListingsPage />} />
          <Route path="/listings/:id"    element={<ListingDetail />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
        </Route>

        {/* ── Seller ─────────────────────────── */}
        <Route path="/seller" element={<RequireAuth role="seller"><SellerLayout /></RequireAuth>}>
          <Route index                   element={<SellerDashboard />} />
          <Route path="listings"         element={<MyListings />} />
          <Route path="listings/new"     element={<NewListing />} />
          <Route path="listings/:id/edit"element={<EditListing />} />
          <Route path="profile"          element={<SellerProfile />} />
        </Route>

        {/* ── Admin ──────────────────────────── */}
        <Route path="/admin" element={<RequireAuth role="admin"><AdminLayout /></RequireAuth>}>
          <Route index                   element={<AdminDashboard />} />
          <Route path="listings"         element={<AdminListings />} />
          <Route path="listings/:id"     element={<AdminReview />} />
          <Route path="inquiries"        element={<AdminInquiries />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
