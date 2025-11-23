import { useLanguage } from '../contexts/LanguageContext'
import ptBR from '../locales/pt-BR'
import enUS from '../locales/en-US'

const translations = {
  'pt-BR': ptBR,
  'en-US': enUS,
}

export function useTranslation() {
  const { language } = useLanguage()

  const t = (key, params = {}) => {
    const translation = translations[language]?.[key] || key
    
    // Substituir parâmetros no formato {param}
    if (Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
    }
    
    return translation
  }

  return { t, language }
}

