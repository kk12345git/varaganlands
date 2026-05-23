import React, { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListPlus, List, User, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/seller',              icon: LayoutDashboard, label: 'Dashboard',    end: true },
  { to: '/seller/listings',     icon: List,            label: 'My Listings'          },
  { to: '/seller/listings/new', icon: ListPlus,        label: 'Add New Land'         },
  { to: '/seller/profile',      icon: User,            label: 'Profile'              },
]

export default function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut(); toast.success('Signed out'); navigate('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile?'':'hidden md:flex'} flex-col w-64 bg-white border-r border-gray-100 min-h-screen`}>
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link to="/" className="font-display font-bold text-forest-700 text-lg">Varagam</Link>
        <span className="ml-2 text-xs bg-earth-100 text-earth-700 px-2 py-0.5 rounded-full">Seller</span>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="w-10 h-10 bg-forest-100 rounded-full flex items-center justify-center mb-2">
          <span className="font-display font-bold text-forest-600 text-sm">
            {profile?.full_name?.[0]?.toUpperCase() || 'S'}
          </span>
        </div>
        <p className="font-medium text-gray-800 text-sm truncate">{profile?.full_name || 'Seller'}</p>
        <p className="text-xs text-gray-400 truncate">{profile?.phone}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({isActive}) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive ? 'bg-forest-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`
            }
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <Icon size={17}/>{label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-6">
        <button onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
          <LogOut size={17}/>Sign Out
        </button>
        <Link to="/" className="flex items-center gap-2 mt-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600">
          ← Back to site
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-smoke">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setSidebarOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-64 bg-white z-50 flex flex-col shadow-xl">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          <button onClick={()=>setSidebarOpen(true)} className="p-1.5">
            <Menu size={20}/>
          </button>
          <span className="font-display font-bold text-forest-700">Varagam</span>
        </div>

        <main className="flex-1 p-4 md:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
