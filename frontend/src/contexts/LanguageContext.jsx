import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Carregar idioma salvo do localStorage ou usar português como padrão
    const savedLanguage = localStorage.getItem('banco-ai-language')
    return savedLanguage || 'pt-BR'
  })

  useEffect(() => {
    // Salvar idioma no localStorage sempre que mudar
    localStorage.setItem('banco-ai-language', language)
  }, [language])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

