import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { 
  FaTachometerAlt, 
  FaCamera, 
  FaBuilding, 
  FaUsers, 
  FaFilter, 
  FaKey, 
  FaShieldAlt,
  FaChartLine,
  FaMobileAlt,
  FaLock,
  FaCloud,
  FaArrowUp,
  FaCheck
} from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'
import LanguageSelector from '../components/LanguageSelector'

function Recursos() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Mostrar/esconder botão voltar ao topo
          setShowBackToTop(currentScrollY > 300)
          
          // Se rolar para baixo mais de 100px, esconde o header
          if (currentScrollY > 100) {
            // Se está rolando para baixo, esconde
            if (currentScrollY > lastScrollY) {
              setIsScrolled(true)
            } else {
              // Se está rolando para cima, mostra
              setIsScrolled(false)
            }
          } else {
            // No topo, sempre mostra
            setIsScrolled(false)
          }
          
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const recursos = [
    {
      icon: Logo,
      iconProps: { className: 'text-red-600', size: 'large' },
      titleKey: 'resources.features.carManagement',
      descriptionKey: 'resources.features.carManagementDesc',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      icon: FaTachometerAlt,
      titleKey: 'resources.features.mileageControl',
      descriptionKey: 'resources.features.mileageControlDesc',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: FaCamera,
      titleKey: 'resources.features.photoUpload',
      descriptionKey: 'resources.features.photoUploadDesc',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      icon: FaBuilding,
      titleKey: 'resources.features.multiCompany',
      descriptionKey: 'resources.features.multiCompanyDesc',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      icon: FaUsers,
      titleKey: 'resources.features.userControl',
      descriptionKey: 'resources.features.userControlDesc',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      icon: FaFilter,
      titleKey: 'resources.features.advancedSearch',
      descriptionKey: 'resources.features.advancedSearchDesc',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      icon: FaKey,
      titleKey: 'resources.features.apiKeys',
      descriptionKey: 'resources.features.apiKeysDesc',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      icon: FaShieldAlt,
      titleKey: 'resources.features.advancedSecurity',
      descriptionKey: 'resources.features.advancedSecurityDesc',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100'
    },
    {
      icon: FaChartLine,
      titleKey: 'resources.features.reports',
      descriptionKey: 'resources.features.reportsDesc',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100'
    },
    {
      icon: FaMobileAlt,
      titleKey: 'resources.features.responsive',
      descriptionKey: 'resources.features.responsiveDesc',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100'
    },
    {
      icon: FaLock,
      titleKey: 'resources.features.https',
      descriptionKey: 'resources.features.httpsDesc',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100'
    },
    {
      icon: FaCloud,
      titleKey: 'resources.features.cloud',
      descriptionKey: 'resources.features.cloudDesc',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      hoverColor: 'hover:bg-sky-100'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-black via-gray-900 to-black' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <header className={`${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDark ? 'border-red-600/30' : 'border-red-600/20'} fixed top-0 left-0 right-0 z-50 transition-transform duration-300 will-change-transform ${
        isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo className="text-red-600" size="default" />
              <h1 className={`text-xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BANCO AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Seletor de Idioma */}
              <LanguageSelector />
              <button
                onClick={() => navigate('/login')}
                className={`${isDark ? 'text-white hover:text-red-600' : 'text-gray-700 hover:text-red-600'} transition-colors text-sm md:text-base`}
              >
                {t('resources.login')}
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm md:text-base"
              >
                {t('resources.createAccount')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com Parallax */}
      <section className="container mx-auto px-4 py-16 md:py-24 pt-32 md:pt-40 text-center parallax-container">
        <div className="flex items-center justify-center mb-6 parallax-element" style={{ transform: 'translateY(0)' }}>
          <Logo className="text-red-600 animate-pulse" size="xl" />
        </div>
        <div className="mb-10 md:mb-14">
          <h2 className={`text-4xl md:text-6xl font-bold gradient-text ${isDark ? '' : 'text-gray-900'} relative z-10`} style={{ lineHeight: '1.2', paddingBottom: '1rem' }}>
            {t('resources.title')}
          </h2>
        </div>
        <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'} relative z-10`}>
          {t('resources.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-all text-lg font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('resources.startNow')}
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`${isDark ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border-gray-300'} px-8 py-3 rounded-md transition-all text-lg font-semibold border`}
          >
            {t('resources.haveAccount')}
          </button>
        </div>
      </section>

      {/* Seção de Estatísticas com Reveal */}
      <section className={`container mx-auto px-4 py-12 ${isDark ? 'bg-black/30' : 'bg-white/50'} rounded-lg mb-16 will-change-auto gradient-border`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="reveal-on-scroll stagger-animation" style={{ animationDelay: '0.1s' }} onAnimationEnd={(e) => e.currentTarget.classList.add('animated', 'revealed')}>
            <div className={`text-4xl md:text-5xl font-bold mb-2 gradient-text`}>
              1000+
            </div>
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('resources.managedVehicles')}
            </div>
          </div>
          <div className="reveal-on-scroll stagger-animation" style={{ animationDelay: '0.2s' }} onAnimationEnd={(e) => e.currentTarget.classList.add('animated', 'revealed')}>
            <div className={`text-4xl md:text-5xl font-bold mb-2 gradient-text`}>
              50+
            </div>
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('resources.companiesTrust')}
            </div>
          </div>
          <div className="reveal-on-scroll stagger-animation" style={{ animationDelay: '0.3s' }} onAnimationEnd={(e) => e.currentTarget.classList.add('animated', 'revealed')}>
            <div className={`text-4xl md:text-5xl font-bold mb-2 gradient-text`}>
              99.9%
            </div>
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('resources.uptimeGuaranteed')}
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('resources.platformFeatures')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recursos.map((recurso, index) => {
            const Icon = recurso.icon
            return (
              <div
                key={index}
                className={`glass-container p-6 transition-transform duration-200 transform hover:scale-105 cursor-pointer border-2 ${
                  isDark 
                    ? 'border-gray-700 hover:border-red-600/50' 
                    : 'border-gray-200 hover:border-red-600/30'
                } stagger-animation`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onAnimationEnd={(e) => e.currentTarget.classList.add('animated')}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${recurso.color} text-4xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {recurso.iconProps ? (
                      <Icon {...recurso.iconProps} />
                    ) : (
                      <Icon />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t(recurso.titleKey)}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t(recurso.descriptionKey)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 md:p-12 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('resources.readyToStart')}
          </h3>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            {t('resources.createFreeAccount')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-red-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-all text-lg font-semibold transform hover:scale-105 shadow-lg"
            >
              {t('resources.createFreeAccountButton')}
            </button>
            <div className={`flex items-center space-x-2 ${isDark ? 'text-red-200' : 'text-red-100'}`}>
              <FaCheck className="text-green-300" />
              <span className="text-sm">{t('resources.noCreditCard')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-black/50 border-gray-800' : 'bg-white/50 border-gray-200'} border-t py-8`}>
        <div className="container mx-auto px-4 text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {t('resources.footer')}
          </p>
        </div>
      </footer>

      {/* Botão Voltar ao Topo */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 z-50 ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-red-600/50`}
          aria-label="Voltar ao topo"
        >
          <FaArrowUp className="text-xl" />
        </button>
      )}
    </div>
  )
}

export default Recursos

