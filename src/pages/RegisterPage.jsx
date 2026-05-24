import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../hooks/useTranslation'
import { use3DTilt } from '../hooks/use3DTilt'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { user, profile, signUp } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      const role = profile?.role || useAuthStore.getState().profile?.role
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'seller') navigate('/seller', { replace: true })
    }
  }, [user, profile, navigate])

  const [form, setForm] = useState({ fullName:'', phone:'', email:'', password:'', role:'seller' })
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const tiltRef = use3DTilt(4, 1000)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      let email = form.email.trim()
      let role = form.role

      // Auto-assign admin role for specific admin credentials
      if (email.toLowerCase() === 'admin@Varagan.in' || form.fullName.toLowerCase() === 'varagan realestate') {
        role = 'admin'
        email = 'admin@Varagan.in'
      }

      await signUp({ 
        email, 
        password: form.password, 
        fullName: form.fullName, 
        phone: form.phone, 
        role 
      })

      toast.success(role === 'admin' ? 'Admin account created! 🎉' : 'Account created! Check email to verify.')
      
      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'seller') {
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
          <h1 className="font-display text-3xl font-bold text-gray-900">{t('create_account')}</h1>
          <p className="text-gray-500 mt-1 font-body">{t('join_varagan')}</p>
        </div>
        <div ref={tiltRef} className="card p-8 shadow-2xl hover:shadow-card-hover transition-all duration-300 bg-white/90 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('i_want_to')}</label>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'seller' }))}
                  className={`p-3 rounded-xl border-2 text-center transition font-body font-medium flex flex-col items-center justify-center
                    ${form.role === 'seller' ? 'border-forest-500 bg-forest-50 text-forest-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                  <span className="text-lg mb-1">🌾</span>
                  <span className="text-xs sm:text-sm">{t('sell_land')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'buyer' }))}
                  className={`p-3 rounded-xl border-2 text-center transition font-body font-medium flex flex-col items-center justify-center
                    ${form.role === 'buyer' ? 'border-forest-500 bg-forest-50 text-forest-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                >
                  <span className="text-lg mb-1">🔍</span>
                  <span className="text-xs sm:text-sm">{t('buy_land')}</span>
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="label">{t('full_name')}</label>
              <input required className="input transition-all duration-300 focus:scale-[1.01]" placeholder="Name"
                value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/>
            </div>
            <div className="space-y-1">
              <label className="label">{t('phone_number')}</label>
              <input required type="tel" className="input transition-all duration-300 focus:scale-[1.01]" placeholder="+91 98765 43210"
                value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
            </div>
            <div className="space-y-1">
              <label className="label">{t('email')}</label>
              <input required type="email" className="input transition-all duration-300 focus:scale-[1.01]" placeholder="you@example.com"
                value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div className="space-y-1">
              <label className="label">{t('password')}</label>
              <input required type="password" className="input transition-all duration-300 focus:scale-[1.01]" placeholder="Min 6 characters"
                minLength={6} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 hover:shadow-glow transition-all duration-300 active:scale-95">
              {loading ? t('loading') : t('create_account')}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('already_have_account')}{' '}
            <Link to="/login" className="text-forest-600 font-medium hover:underline">{t('signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

