import React, { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, MessageSquare, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/listings',   icon: FileText,         label: 'Listings'            },
  { to: '/admin/inquiries',  icon: MessageSquare,    label: 'Inquiries'           },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); toast.success('Signed out'); navigate('/') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile?'':'hidden md:flex'} flex-col w-64 bg-forest-900 min-h-screen text-forest-100`}>
      <div className="h-16 flex items-center px-6 border-b border-forest-700">
        <ShieldCheck size={18} className="text-forest-300 mr-2"/>
        <span className="font-display font-bold text-white text-lg">Admin Panel</span>
      </div>
      <div className="px-6 py-4 border-b border-forest-700/50">
        <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center mb-2">
          <span className="font-bold text-white text-sm">{profile?.full_name?.[0]?.toUpperCase()||'A'}</span>
        </div>
        <p className="text-sm font-medium text-white truncate">{profile?.full_name||'Admin'}</p>
        <p className="text-xs text-forest-400">Administrator</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({isActive}) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive ? 'bg-white/15 text-white' : 'text-forest-300 hover:text-white hover:bg-white/8'}`
            }
            onClick={() => mobile && setOpen(false)}
          >
            <Icon size={17}/>{label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6 flex flex-col gap-1">
        <button onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition">
          <LogOut size={17}/>Sign Out
        </button>
        <Link to="/" className="px-3 py-2 text-xs text-forest-500 hover:text-forest-300">← Public site</Link>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)}/>
          <div className="absolute left-0 top-0 h-full w-64 z-50 flex flex-col shadow-2xl">
            <Sidebar mobile />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-14 bg-forest-900 flex items-center px-4 gap-3">
          <button onClick={()=>setOpen(true)} className="p-1.5 text-white"><Menu size={20}/></button>
          <span className="font-display font-bold text-white">Admin Panel</span>
        </div>
        <main className="flex-1 p-4 md:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
