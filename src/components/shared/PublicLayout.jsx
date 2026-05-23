import React, { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Home, MapPin, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const dashPath = profile?.role === 'admin' ? '/admin' : '/seller'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="page-container h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">V</span>
            </div>
            <div>
              <span className="font-display font-bold text-forest-700 text-lg leading-none block">Varagan</span>
              <span className="text-xs text-gray-400 font-body leading-none">Real Estate</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={({isActive})=>`text-sm font-medium transition ${isActive?'text-forest-600':'text-gray-600 hover:text-forest-600'}`} end>
              Home
            </NavLink>
            <NavLink to="/listings" className={({isActive})=>`text-sm font-medium transition ${isActive?'text-forest-600':'text-gray-600 hover:text-forest-600'}`}>
              Browse Listings
            </NavLink>
            {user ? (
              <>
                <NavLink to={dashPath} className="text-sm font-medium text-gray-600 hover:text-forest-600 transition">
                  Dashboard
                </NavLink>
                <button onClick={handleSignOut} className="btn-secondary py-2 px-4 text-sm">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-forest-600">Sign In</Link>
                <Link to="/login?admin=true" className="text-sm font-medium text-gray-600 hover:text-forest-600">Admin</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">List Your Land</Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="page-container py-4 flex flex-col gap-3">
              <Link to="/" onClick={()=>setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2"><Home size={16}/>Home</Link>
              <Link to="/listings" onClick={()=>setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2"><MapPin size={16}/>Browse Listings</Link>
              {user ? (
                <>
                  <Link to={dashPath} onClick={()=>setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2"><LayoutDashboard size={16}/>Dashboard</Link>
                  <button onClick={()=>{handleSignOut();setOpen(false)}} className="flex items-center gap-2 text-sm font-medium text-red-500 py-2"><LogOut size={16}/>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={()=>setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2"><LogIn size={16}/>Sign In</Link>
                  <Link to="/login?admin=true" onClick={()=>setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2"><LogIn size={16}/>Admin</Link>
                  <Link to="/register" onClick={()=>setOpen(false)} className="btn-primary text-sm text-center">List Your Land</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-100 py-10 mt-16">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl text-white mb-2">Varagan</h3>
              <p className="text-sm text-forest-300">Tamil Nadu's trusted land marketplace. Direct. Transparent. No commission.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-forest-300">
                <Link to="/listings" className="hover:text-white transition">Browse Listings</Link>
                <Link to="/register" className="hover:text-white transition">Sell Your Land</Link>
                <Link to="/login"    className="hover:text-white transition">Sign In</Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-3">Contact</h4>
              <p className="text-sm text-forest-300">admin@Varagan.in<br/>Tamil Nadu, India</p>
            </div>
          </div>
          <div className="border-t border-forest-700 mt-8 pt-6 text-center text-xs text-forest-400">
            © {new Date().getFullYear()} Varagan Real Estate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

