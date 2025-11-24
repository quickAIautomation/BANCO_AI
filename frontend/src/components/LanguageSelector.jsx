import { useState, useRef, useEffect } from 'react'
import { FaGlobe, FaChevronDown } from 'react-icons/fa'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'

const languages = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' }
]

export default function LanguageSelector({ className = '' }) {
  const { language, changeLanguage } = useLanguage()
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-secondary flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-w-[80px] sm:min-w-[140px] justify-between ${
          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
        }`}
      >
        <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
          <FaGlobe className="text-red-600 flex-shrink-0 text-xs sm:text-sm" />
          <span className="truncate text-xs sm:text-sm">
            <span className="sm:hidden">{currentLanguage.flag}</span>
            <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.label}</span>
          </span>
        </div>
        <FaChevronDown className={`text-xs transition-transform flex-shrink-0 ml-1 sm:ml-2 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute top-full right-0 mt-2 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[180px] ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                lang.code === language
                  ? 'bg-red-600 text-white'
                  : isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              } ${languages.indexOf(lang) === 0 ? 'rounded-t-lg' : ''} ${
                languages.indexOf(lang) === languages.length - 1 ? 'rounded-b-lg' : ''
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {lang.code === language && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

