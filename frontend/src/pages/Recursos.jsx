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
  FaCloud
} from 'react-icons/fa'

function Recursos() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
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
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className={`bg-black/95 backdrop-blur-md border-b border-red-600/30 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isScrolled ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaCar className="text-red-600 text-2xl md:text-3xl" />
              <h1 className="text-xl md:text-3xl font-bold text-white">BANCO AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-red-600 transition-colors text-sm md:text-base"
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 pt-32 md:pt-40 text-center">
        <div className="flex items-center justify-center mb-6">
          <FaCar className="text-red-600 text-6xl md:text-8xl animate-pulse" />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Sistema de Gerenciamento de Carros
        </h2>
        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
          Gerencie sua frota de veículos de forma inteligente, segura e eficiente
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors text-lg font-semibold"
          >
            Começar Agora
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-800 text-white px-8 py-3 rounded-md hover:bg-gray-700 transition-colors text-lg font-semibold border border-gray-700"
          >
            Já tenho conta
          </button>
        </div>
      </section>

      {/* Recursos Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Recursos da Plataforma
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recursos.map((recurso, index) => {
            const Icon = recurso.icon
            return (
              <div
                key={index}
                className={`${recurso.bgColor} ${recurso.hoverColor} rounded-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer border-2 border-transparent hover:border-gray-300`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${recurso.color} text-4xl flex-shrink-0`}>
                    <Icon />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {recurso.title}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
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
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-8 md:p-12">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a gerenciar sua frota hoje mesmo
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-red-600 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Criar Conta Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 BANCO AI - Sistema de Gerenciamento de Carros
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Recursos

