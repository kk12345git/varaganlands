import React, { useState } from 'react'
import { Smartphone, X, Download } from 'lucide-react'
import { usePWAInstall } from '../../hooks/usePWAInstall'

export default function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-fade-up">
      <div className="bg-forest-900 text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone size={18}/>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Install Varagam App</p>
          <p className="text-xs text-forest-300 mt-0.5">Works offline · Add to home screen</p>
          <button onClick={install}
            className="flex items-center gap-1.5 mt-2 bg-earth-500 hover:bg-earth-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
            <Download size={12}/>Install Now
          </button>
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-forest-400 hover:text-white transition p-0.5 flex-shrink-0">
          <X size={16}/>
        </button>
      </div>
    </div>
  )
}
