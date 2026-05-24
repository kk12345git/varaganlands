import { create } from 'zustand'

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem('varagan_lang') || 'ta',
  setLanguage: (lang) => {
    localStorage.setItem('varagan_lang', lang)
    set({ language: lang })
    // Also update document HTML lang attribute dynamically
    document.documentElement.lang = lang
  }
}))
