import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { FaArrowLeft, FaKey, FaPlus, FaTrash, FaCheck, FaTimes, FaCopy, FaMoon, FaSun, FaBell, FaBellSlash, FaCog, FaEnvelope, FaEnvelopeOpen, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import { useNotification } from '../contexts/NotificationContext'

function Configuracoes({ setIsAuthenticated }) {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [novaChaveNome, setNovaChaveNome] = useState('')
  const [novaChaveCompleta, setNovaChaveCompleta] = useState(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [emailNotificacoesAtivadas, setEmailNotificacoesAtivadas] = useState(true)
  const [loadingEmailNotif, setLoadingEmailNotif] = useState(false)
  const [showN8nInstructions, setShowN8nInstructions] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()
  const { notificationsEnabled, toggleNotifications } = useNotification()

  useEffect(() => {
    carregarApiKeys()
    carregarPreferenciasEmail()
  }, [])
  
  const carregarPreferenciasEmail = async () => {
    try {
      const response = await api.get('/usuarios/perfil')
      if (response.data.emailNotificacoesAtivadas !== undefined) {
        setEmailNotificacoesAtivadas(response.data.emailNotificacoesAtivadas)
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de email:', error)
    }
  }
  
  const handleToggleEmailNotificacoes = async () => {
    const novoValor = !emailNotificacoesAtivadas
    setLoadingEmailNotif(true)
    try {
      await api.put('/usuarios/perfil/email-notificacoes', novoValor)
      setEmailNotificacoesAtivadas(novoValor)
      setSucesso(`Notificações por email ${novoValor ? 'ativadas' : 'desativadas'} com sucesso!`)
      setTimeout(() => setSucesso(''), 3000)
    } catch (error) {
      setErro('Erro ao atualizar preferências de email')
      setTimeout(() => setErro(''), 3000)
    } finally {
      setLoadingEmailNotif(false)
    }
  }

  const carregarApiKeys = async () => {
    try {
      setLoading(true)
      const response = await api.get('/apikeys')
      setApiKeys(response.data)
    } catch (error) {
      console.error('Erro ao carregar API Keys:', error)
      if (error.response?.status === 401) {
        setIsAuthenticated(false)
        // O interceptor já vai redirecionar, mas garantimos que o estado seja limpo
        setApiKeys([])
      } else {
        // Se não for 401, limpar lista para evitar mostrar dados antigos
        setApiKeys([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCriarApiKey = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    try {
      const response = await api.post('/apikeys', {
        nome: novaChaveNome || `API Key ${new Date().toLocaleDateString()}`
      })
      setNovaChaveCompleta(response.data.chave)
      setNovaChaveNome('')
      setShowForm(false)
      setSucesso('API Key criada com sucesso! Copie a chave agora, pois ela não será exibida novamente.')
      carregarApiKeys()
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao criar API Key')
    }
  }

  const handleDesativarApiKey = async (id) => {
    if (!window.confirm('Tem certeza que deseja desativar esta API Key?')) {
      return
    }

    try {
      await api.put(`/apikeys/${id}/desativar`)
      setSucesso('API Key desativada com sucesso!')
      carregarApiKeys()
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao desativar API Key')
    }
  }

  const handleAtivarApiKey = async (id) => {
    try {
      await api.put(`/apikeys/${id}/ativar`)
      setSucesso('API Key ativada com sucesso!')
      carregarApiKeys()
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao ativar API Key')
    }
  }

  const handleDeletarApiKey = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta API Key? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await api.delete(`/apikeys/${id}`)
      setSucesso('API Key deletada com sucesso!')
      carregarApiKeys()
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao deletar API Key')
    }
  }

  const copiarChave = (chave) => {
    navigator.clipboard.writeText(chave)
    setSucesso('Chave copiada para a área de transferência!')
    setTimeout(() => setSucesso(''), 3000)
  }


  const formatarData = (data) => {
    if (!data) return 'Nunca'
    return new Date(data).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Carregando configurações...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b-2 border-red-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-red-600 transition-colors"
                aria-label="Voltar"
              >
                <FaArrowLeft className="text-2xl" />
              </button>
              <FaCog className="text-red-600 text-3xl" />
              <h1 className="text-3xl font-bold text-white">Configurações</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Mensagens */}
        {erro && (
          <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded mb-4 flex items-center space-x-2">
            <FaCheck />
            <span>{sucesso}</span>
          </div>
        )}

        {/* Configurações Gerais */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Configurações Gerais</h3>
          
          <div className="space-y-6">
            {/* Tema */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <FaMoon className="text-red-600 text-xl" />
                ) : (
                  <FaSun className="text-yellow-500 text-xl" />
                )}
                <div>
                  <h4 className="text-white font-semibold">Tema</h4>
                  <p className="text-gray-400 text-sm">Escolha entre tema claro ou escuro</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={toggleTheme}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  {isDark ? 'Escuro' : 'Claro'}
                </span>
              </label>
            </div>

            {/* Notificações */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {notificationsEnabled ? (
                  <FaBell className="text-red-600 text-xl" />
                ) : (
                  <FaBellSlash className="text-gray-500 text-xl" />
                )}
                <div>
                  <h4 className="text-white font-semibold">Notificações</h4>
                  <p className="text-gray-400 text-sm">Ative ou desative as notificações do sistema</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  {notificationsEnabled ? 'Ativadas' : 'Desativadas'}
                </span>
              </label>
            </div>

            {/* Notificações por Email */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {emailNotificacoesAtivadas ? (
                  <FaEnvelope className="text-red-600 text-xl" />
                ) : (
                  <FaEnvelopeOpen className="text-gray-500 text-xl" />
                )}
                <div>
                  <h4 className="text-white font-semibold">Notificações por Email</h4>
                  <p className="text-gray-400 text-sm">Receba emails quando novos carros forem cadastrados</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotificacoesAtivadas}
                  onChange={handleToggleEmailNotificacoes}
                  disabled={loadingEmailNotif}
                  className="sr-only peer"
                />
                <div className={`w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600 ${loadingEmailNotif ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  {emailNotificacoesAtivadas ? 'Ativadas' : 'Desativadas'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Nova API Key - Modal */}
        {novaChaveCompleta && (
          <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Nova API Key Criada!</h3>
              <button
                onClick={() => {
                  setNovaChaveCompleta(null)
                  setSucesso('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-yellow-300 mb-4">
              ⚠️ Copie esta chave agora! Ela não será exibida novamente por segurança.
            </p>
            <div className="bg-black rounded p-4 mb-4 flex items-center justify-between">
              <code className="text-green-400 font-mono text-sm break-all">{novaChaveCompleta}</code>
              <button
                onClick={() => copiarChave(novaChaveCompleta)}
                className="btn-primary ml-4 flex items-center space-x-2"
              >
                <FaCopy />
                <span>Copiar</span>
              </button>
            </div>
            <div className="bg-gray-800 rounded p-4">
              <p className="text-white text-sm mb-2"><strong>Como usar no n8n:</strong></p>
              <code className="text-gray-300 text-xs block">
                GET http://localhost:8080/api/public/carros<br />
                Header: X-API-Key: {novaChaveCompleta}
              </code>
            </div>
          </div>
        )}

        {/* Criar Nova API Key */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaKey className="text-red-600 text-xl" />
              <h3 className="text-xl font-bold text-white">Criar Nova API Key</h3>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setErro('')
                setSucesso('')
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FaPlus />
              <span>{showForm ? 'Cancelar' : 'Nova API Key'}</span>
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCriarApiKey} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da API Key (opcional)
                </label>
                <input
                  type="text"
                  value={novaChaveNome}
                  onChange={(e) => setNovaChaveNome(e.target.value)}
                  placeholder="Ex: Integração n8n"
                  className="input-enhanced w-full text-white"
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Criar API Key
              </button>
            </form>
          )}
        </div>

        {/* Lista de API Keys */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Suas API Keys</h3>
          
          {apiKeys.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon" style={{ width: '80px', height: '80px' }}>
                <FaKey className="text-4xl text-red-600" />
              </div>
              <h3 className="empty-state-title" style={{ fontSize: '20px' }}>Nenhuma API Key criada</h3>
              <p className="empty-state-description" style={{ fontSize: '14px' }}>
                Crie uma para começar a integrar com n8n!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className={`bg-gray-800 rounded-lg p-4 border ${
                    apiKey.ativa ? 'border-green-600' : 'border-gray-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-white font-semibold">{apiKey.nome}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            apiKey.ativa
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {apiKey.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      
                      <div className="bg-black rounded p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <code className="text-gray-400 font-mono text-sm break-all">
                            {apiKey.chave}
                          </code>
                          {!apiKey.chave.startsWith('...') && (
                            <button
                              onClick={() => copiarChave(apiKey.chave)}
                              className="ml-4 text-gray-400 hover:text-white flex-shrink-0"
                              title="Copiar chave completa"
                            >
                              <FaCopy />
                            </button>
                          )}
                        </div>
                        {apiKey.chave.startsWith('...') && (
                          <p className="text-yellow-400 text-xs mt-2">
                            ⚠️ A chave completa não está disponível por segurança. Crie uma nova chave se necessário.
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div>
                          <span className="text-gray-500">Criada em:</span>
                          <p className="text-white">{formatarData(apiKey.dataCriacao)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Último uso:</span>
                          <p className="text-white">{formatarData(apiKey.ultimoUso)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total de usos:</span>
                          <p className="text-white">{apiKey.totalUsos || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {apiKey.ativa ? (
                        <button
                          onClick={() => handleDesativarApiKey(apiKey.id)}
                          className="btn-warning text-sm px-3 py-2"
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAtivarApiKey(apiKey.id)}
                          className="btn-success text-sm px-3 py-2"
                        >
                          Ativar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletarApiKey(apiKey.id)}
                        className="btn-danger text-sm px-3 py-2 flex items-center justify-center space-x-1"
                      >
                        <FaTrash />
                        <span>Deletar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instruções n8n - Dropdown */}
        <div className="bg-gray-900 rounded-lg mt-6 border border-gray-700 overflow-hidden">
          <button
            onClick={() => setShowN8nInstructions(!showN8nInstructions)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800 transition-colors"
          >
            <h3 className="text-xl font-bold text-white">n8n</h3>
            {showN8nInstructions ? (
              <FaChevronUp className="text-gray-400" />
            ) : (
              <FaChevronDown className="text-gray-400" />
            )}
          </button>
          {showN8nInstructions && (
            <div className="px-4 pb-4 space-y-3 text-gray-300">
              <p>1. Crie uma API Key acima</p>
              <p>2. No n8n, adicione um nó HTTP Request</p>
              <p>3. Configure a URL: <code className="bg-black px-2 py-1 rounded">http://localhost:8080/api/public/carros</code></p>
              <p>4. Adicione o header: <code className="bg-black px-2 py-1 rounded">X-API-Key: sua_chave_aqui</code></p>
              <p>5. Execute o workflow!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Configuracoes

