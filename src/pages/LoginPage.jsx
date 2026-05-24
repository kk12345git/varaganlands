import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { use3DTilt } from '../hooks/use3DTilt'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export function LoginPage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const isAdminPrefill = queryParams.get('admin') === 'true'
  const { t } = useTranslation()
  const tiltRef = use3DTilt(4, 1000) // gentle tilt
  const { user, profile, signIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const role = profile?.role || useAuthStore.getState().profile?.role
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'seller') navigate('/seller', { replace: true })
    }
  }, [user, profile, navigate])

  const [form, setForm]     = useState({ 
    email: isAdminPrefill ? 'Varagan Realestate' : '', 
    password: '' 
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-forest-50/20 to-transparent">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-forest-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md hover:scale-110 transition-transform duration-300">
            <span className="font-display font-bold text-white text-xl">V</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">{t('welcome_back')}</h1>
          <p className="text-gray-500 mt-1 font-body">{t('signin_sub')}</p>
        </div>

        <div ref={tiltRef} className="card p-8 shadow-2xl hover:shadow-card-hover transition-all duration-300 bg-white/90 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="label">{t('email_or_username')}</label>
              <input type="text" required className="input transition-all duration-300 focus:scale-[1.01]" placeholder="you@example.com or Varagan Realestate"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div className="space-y-1">
              <label className="label">{t('password')}</label>
              <div className="relative">
                <input type={showPw?'text':'password'} required className="input pr-10 transition-all duration-300 focus:scale-[1.01]" placeholder="••••••••"
                  value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 hover:shadow-glow transition-all duration-300 active:scale-95">
              {loading ? t('loading') : t('signIn')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('dont_have_account')}{' '}
            <Link to="/register" className="text-forest-600 font-medium hover:underline">{t('register_here')}</Link>
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

