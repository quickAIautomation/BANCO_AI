import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { FaArrowLeft, FaKey, FaPlus, FaTrash, FaCheck, FaTimes, FaCopy } from 'react-icons/fa'

function Configuracoes({ setIsAuthenticated }) {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [novaChaveNome, setNovaChaveNome] = useState('')
  const [novaChaveCompleta, setNovaChaveCompleta] = useState(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    carregarApiKeys()
  }, [])

  const carregarApiKeys = async () => {
    try {
      setLoading(true)
      const response = await api.get('/apikeys')
      setApiKeys(response.data)
    } catch (error) {
      console.error('Erro ao carregar API Keys:', error)
      if (error.response?.status === 401) {
        setIsAuthenticated(false)
        navigate('/login')
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
              >
                <FaArrowLeft className="text-2xl" />
              </button>
              <FaKey className="text-red-600 text-3xl" />
              <h1 className="text-3xl font-bold text-white">Configurações - API Keys</h1>
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
                className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
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
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors"
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
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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
            <div className="text-center text-gray-400 py-8">
              <FaKey className="text-4xl mx-auto mb-4 opacity-50" />
              <p>Nenhuma API Key criada ainda.</p>
              <p className="text-sm mt-2">Crie uma para começar a integrar com n8n!</p>
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
                          className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAtivarApiKey(apiKey.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                        >
                          Ativar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletarApiKey(apiKey.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 flex items-center justify-center space-x-1"
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

        {/* Instruções */}
        <div className="bg-gray-900 rounded-lg p-6 mt-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Como usar no n8n</h3>
          <div className="space-y-3 text-gray-300">
            <p>1. Crie uma API Key acima</p>
            <p>2. No n8n, adicione um nó HTTP Request</p>
            <p>3. Configure a URL: <code className="bg-black px-2 py-1 rounded">http://localhost:8080/api/public/carros</code></p>
            <p>4. Adicione o header: <code className="bg-black px-2 py-1 rounded">X-API-Key: sua_chave_aqui</code></p>
            <p>5. Execute o workflow!</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Configuracoes

