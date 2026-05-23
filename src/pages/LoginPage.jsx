import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn }   = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      let email = form.email.trim()
      if (email.toLowerCase() === 'varagan realestate') {
        email = 'admin@Varagan.in'
      }
      await signIn({ email, password: form.password })
      toast.success('Welcome back!')
      const p = useAuthStore.getState().profile
      if (p?.role === 'admin') {
        navigate('/admin')
      } else if (p?.role === 'seller') {
        navigate('/seller')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-white text-xl">V</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1 font-body">Sign in to your Varagan account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or Username / பயனர் பெயர்</label>
              <input type="text" required className="input" placeholder="you@example.com or Varagan Realestate"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} required className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-forest-600 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ fullName:'', phone:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone })
      toast.success('Account created! Please check your email to verify.')
      navigate('/seller')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-white text-xl">V</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Start selling</h1>
          <p className="text-gray-500 mt-1 font-body">Create your free seller account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input required className="input" placeholder="உங்கள் பெயர்"
                value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input required type="tel" className="input" placeholder="+91 98765 43210"
                value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Email</label>
              <input required type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Password</label>
              <input required type="password" className="input" placeholder="Min 6 characters"
                minLength={6} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-medium hover:underline">Sign in</Link>
          </p>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering you agree to list land honestly and provide accurate information.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

