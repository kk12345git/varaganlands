import { useLanguageStore } from '../store/languageStore'
import { translations } from '../lib/translations'

export function useTranslation() {
  const language = useLanguageStore(s => s.language)
  const setLanguage = useLanguageStore(s => s.setLanguage)

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key
  }

  return { t, language, setLanguage }
}
