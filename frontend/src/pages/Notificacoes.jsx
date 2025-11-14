import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../contexts/NotificationContext'
import Header from '../components/Header'
import { FaBell, FaTrash, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle, FaCar, FaSignOutAlt, FaUser, FaBuilding, FaFilter } from 'react-icons/fa'
import { removeToken } from '../utils/auth'

function Notificacoes({ setIsAuthenticated }) {
  const { history, clearHistory } = useNotification()
  const [filter, setFilter] = useState('all') // all, success, error, warning, info
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-xl" />
      case 'error':
        return <FaTimesCircle className="text-red-500 text-xl" />
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500 text-xl" />
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-xl" />
      default:
        return <FaInfoCircle className="text-gray-500 text-xl" />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-600/20 border-green-600/50'
      case 'error':
        return 'bg-red-600/20 border-red-600/50'
      case 'warning':
        return 'bg-yellow-600/20 border-yellow-600/50'
      case 'info':
        return 'bg-blue-600/20 border-blue-600/50'
      default:
        return 'bg-gray-600/20 border-gray-600/50'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'success':
        return 'Sucesso'
      case 'error':
        return 'Erro'
      case 'warning':
        return 'Aviso'
      case 'info':
        return 'Informação'
      default:
        return 'Notificação'
    }
  }

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(n => n.type === filter)

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`
    
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const customButtons = (
    <>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm md:text-base py-2 md:py-0"
      >
        <FaCar />
        <span>Carros</span>
      </button>
      <button
        onClick={() => navigate('/empresas')}
        className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm md:text-base py-2 md:py-0"
      >
        <FaBuilding />
        <span>Empresas</span>
      </button>
      <button
        onClick={() => navigate('/perfil')}
        className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm md:text-base py-2 md:py-0"
      >
        <FaUser />
        <span>Perfil</span>
      </button>
      <button
        onClick={handleLogout}
        className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm md:text-base py-2 md:py-0"
      >
        <FaSignOutAlt />
        <span>Sair</span>
      </button>
    </>
  )

  return (
    <div className="min-h-screen bg-black">
      <Header
        title="Notificações"
        icon={FaBell}
        customButtons={customButtons}
        showBackButton={true}
        backTo="/dashboard"
      />

      <main className="container mx-auto px-4 py-8">
        {/* Filtros e ações */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`btn-primary flex items-center space-x-2 ${
                filter !== 'all' ? 'bg-red-600' : ''
              }`}
            >
              <FaFilter />
              {filter !== 'all' && (
                <span className="text-xs bg-white text-red-600 rounded-full px-2 py-0.5 font-bold">
                  {filter === 'success' ? 'Sucesso' : 
                   filter === 'error' ? 'Erros' : 
                   filter === 'warning' ? 'Avisos' : 
                   filter === 'info' ? 'Informações' : ''}
                </span>
              )}
            </button>
            
            {showFilterMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilterMenu(false)}
                />
                <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[200px]">
                  <button
                    onClick={() => {
                      setFilter('all')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                      filter === 'all' 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    } ${filter === 'all' ? 'rounded-t-lg' : ''}`}
                  >
                    <FaInfoCircle className={filter === 'all' ? 'text-white' : 'text-gray-400'} />
                    <span>Todas</span>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('success')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                      filter === 'success' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <FaCheckCircle className={filter === 'success' ? 'text-white' : 'text-green-500'} />
                    <span>Sucesso</span>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('error')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                      filter === 'error' 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <FaTimesCircle className={filter === 'error' ? 'text-white' : 'text-red-500'} />
                    <span>Erros</span>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('warning')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                      filter === 'warning' 
                        ? 'bg-yellow-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <FaExclamationCircle className={filter === 'warning' ? 'text-white' : 'text-yellow-500'} />
                    <span>Avisos</span>
                  </button>
                  <button
                    onClick={() => {
                      setFilter('info')
                      setShowFilterMenu(false)
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors rounded-b-lg ${
                      filter === 'info' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <FaInfoCircle className={filter === 'info' ? 'text-white' : 'text-blue-500'} />
                    <span>Informações</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-primary flex items-center space-x-2"
            >
              <FaTrash />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {/* Lista de notificações */}
        {filteredHistory.length === 0 ? (
          <div className="empty-state py-8">
            <div className="empty-state-icon" style={{ width: '80px', height: '80px' }}>
              <FaBell className="text-4xl text-red-600" />
            </div>
            <h3 className="empty-state-title" style={{ fontSize: '20px' }}>
              {filter === 'all' ? 'Nenhuma notificação ainda' : `Nenhuma notificação do tipo "${getTypeLabel(filter)}"`}
            </h3>
            <p className="empty-state-description" style={{ fontSize: '14px' }}>
              As notificações aparecerão aqui quando houver ações no sistema
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((notification) => (
              <div
                key={notification.id}
                className={`${getBgColor(notification.type)} border rounded-lg p-4 flex items-start space-x-4`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {notification.title || getTypeLabel(notification.type)}
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                      {formatDate(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Notificacoes

