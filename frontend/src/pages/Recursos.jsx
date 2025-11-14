import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaCar, 
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

function Recursos() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
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
      icon: FaCar,
      title: 'Gerenciamento de Carros',
      description: 'Cadastre, edite e gerencie toda a frota de veículos da sua empresa de forma simples e organizada.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      icon: FaTachometerAlt,
      title: 'Controle de Quilometragem',
      description: 'Acompanhe a quilometragem de cada veículo e mantenha histórico completo para manutenções preventivas.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      icon: FaCamera,
      title: 'Upload de Fotos',
      description: 'Adicione múltiplas fotos de cada veículo para documentação visual completa e profissional.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      icon: FaBuilding,
      title: 'Gestão Multi-Empresa',
      description: 'Gerencie múltiplas empresas em uma única plataforma, ideal para grupos e franquias.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      icon: FaUsers,
      title: 'Controle de Usuários',
      description: 'Sistema de permissões completo com três níveis: Administrador, Operador e Visualizador.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      icon: FaFilter,
      title: 'Busca Avançada',
      description: 'Filtre veículos por placa, modelo, marca, quilometragem e data de cadastro com busca inteligente.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'hover:bg-pink-100'
    },
    {
      icon: FaKey,
      title: 'API Keys',
      description: 'Gere chaves de API para integração com outros sistemas e automações personalizadas.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      icon: FaShieldAlt,
      title: 'Segurança Avançada',
      description: 'Autenticação JWT, criptografia de senhas e controle de acesso baseado em roles.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      hoverColor: 'hover:bg-teal-100'
    },
    {
      icon: FaChartLine,
      title: 'Relatórios e Análises',
      description: 'Visualize dados importantes e gere relatórios para tomada de decisão estratégica.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100'
    },
    {
      icon: FaMobileAlt,
      title: 'Design Responsivo',
      description: 'Acesse de qualquer dispositivo: desktop, tablet ou smartphone com interface adaptável.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100'
    },
    {
      icon: FaLock,
      title: 'HTTPS e SSL',
      description: 'Conexão segura com certificado SSL, garantindo proteção total dos seus dados.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100'
    },
    {
      icon: FaCloud,
      title: 'Cloud Ready',
      description: 'Infraestrutura preparada para escalabilidade e alta disponibilidade na nuvem.',
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
              <FaCar className="text-red-600 text-2xl md:text-3xl" />
              <h1 className={`text-xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BANCO AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className={`${isDark ? 'text-white hover:text-red-600' : 'text-gray-700 hover:text-red-600'} transition-colors text-sm md:text-base`}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm md:text-base"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section com Parallax */}
      <section className="container mx-auto px-4 py-16 md:py-24 pt-32 md:pt-40 text-center parallax-container">
        <div className="flex items-center justify-center mb-6 parallax-element" style={{ transform: 'translateY(0)' }}>
          <FaCar className={`text-red-600 text-6xl md:text-8xl animate-pulse`} />
        </div>
        <h2 className={`text-4xl md:text-6xl font-bold mb-4 gradient-text ${isDark ? '' : 'text-gray-900'}`}>
          Sistema de Gerenciamento de Carros
        </h2>
        <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Gerencie sua frota de veículos de forma inteligente, segura e eficiente
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-all text-lg font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Começar Agora
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`${isDark ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 border-gray-300'} px-8 py-3 rounded-md transition-all text-lg font-semibold border`}
          >
            Já tenho conta
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
              Veículos Gerenciados
            </div>
          </div>
          <div className="reveal-on-scroll stagger-animation" style={{ animationDelay: '0.2s' }} onAnimationEnd={(e) => e.currentTarget.classList.add('animated', 'revealed')}>
            <div className={`text-4xl md:text-5xl font-bold mb-2 gradient-text`}>
              50+
            </div>
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Empresas Confiam
            </div>
          </div>
          <div className="reveal-on-scroll stagger-animation" style={{ animationDelay: '0.3s' }} onAnimationEnd={(e) => e.currentTarget.classList.add('animated', 'revealed')}>
            <div className={`text-4xl md:text-5xl font-bold mb-2 gradient-text`}>
              99.9%
            </div>
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Uptime Garantido
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recursos da Plataforma
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
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {recurso.title}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {recurso.description}
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
            Pronto para começar?
          </h3>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a gerenciar sua frota hoje mesmo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-red-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-all text-lg font-semibold transform hover:scale-105 shadow-lg"
            >
              Criar Conta Grátis
            </button>
            <div className={`flex items-center space-x-2 ${isDark ? 'text-red-200' : 'text-red-100'}`}>
              <FaCheck className="text-green-300" />
              <span className="text-sm">Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-black/50 border-gray-800' : 'bg-white/50 border-gray-200'} border-t py-8`}>
        <div className="container mx-auto px-4 text-center">
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            © 2024 BANCO AI - Sistema de Gerenciamento de Carros
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

