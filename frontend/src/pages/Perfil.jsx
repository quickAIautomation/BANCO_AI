import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { getApiBaseUrl } from '../services/api'
import { setUserRole } from '../utils/auth'
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaCheck, FaUpload, FaCamera } from 'react-icons/fa'
import ImageEditor from '../components/ImageEditor'

function Perfil({ setIsAuthenticated }) {
  const [usuario, setUsuario] = useState({ email: '', nome: '' })
  const [loading, setLoading] = useState(true)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showSenhaForm, setShowSenhaForm] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loadingFoto, setLoadingFoto] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Formulário de email
  const [novoEmail, setNovoEmail] = useState('')
  const [senhaAtualEmail, setSenhaAtualEmail] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)

  // Formulário de senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loadingSenha, setLoadingSenha] = useState(false)

  useEffect(() => {
    carregarPerfil()
  }, [])

  const carregarPerfil = async () => {
    try {
      const response = await api.get('/usuarios/perfil')
      setUsuario(response.data)
      // Atualizar role no localStorage se necessário
      if (response.data.role) {
        setUserRole(response.data.role)
      }
      // Carregar preview da foto se existir
      if (response.data.foto) {
        const apiBaseUrl = getApiBaseUrl()
        let fotoUrl = response.data.foto
        
        // Se a foto começa com /api, construir URL completa
        if (fotoUrl.startsWith('/api')) {
          fotoUrl = `${apiBaseUrl.replace('/api', '')}${fotoUrl}`
        } else if (!fotoUrl.startsWith('http')) {
          // Se não começa com http nem /api, assumir que é relativa
          fotoUrl = `${apiBaseUrl.replace('/api', '')}/api${fotoUrl}`
        }
        
        // Adicionar timestamp para evitar cache
        setFotoPreview(`${fotoUrl}?t=${Date.now()}`)
      } else {
        setFotoPreview(null)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      if (error.response?.status === 401) {
        setIsAuthenticated(false)
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAtualizarEmail = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setLoadingEmail(true)

    try {
      await api.put('/usuarios/perfil/email', {
        novoEmail,
        senhaAtual: senhaAtualEmail
      })
      setSucesso('Email atualizado com sucesso!')
      setNovoEmail('')
      setSenhaAtualEmail('')
      setShowEmailForm(false)
      carregarPerfil()
    } catch (error) {
      setErro(error.response?.data || 'Erro ao atualizar email')
    } finally {
      setLoadingEmail(false)
    }
  }

  const handleAtualizarSenha = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoadingSenha(true)

    try {
      await api.put('/usuarios/perfil/senha', {
        senhaAtual,
        novaSenha
      })
      setSucesso('Senha atualizada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      setShowSenhaForm(false)
    } catch (error) {
      setErro(error.response?.data || 'Erro ao atualizar senha')
    } finally {
      setLoadingSenha(false)
    }
  }
  
  const handleFotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setErro('Por favor, selecione um arquivo de imagem')
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErro('A imagem deve ter no máximo 5MB')
        return
      }

      // Criar URL para preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImageToCrop(event.target.result)
        setShowCropper(true)
      }
      reader.onerror = () => {
        setErro('Erro ao ler o arquivo')
      }
      reader.readAsDataURL(file)
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedFile) => {
    setShowCropper(false)
    setImageToCrop(null)
    setLoadingFoto(true)
    setErro('')
    setSucesso('')
    
    try {
      const formData = new FormData()
      formData.append('foto', croppedFile)
      
      await api.put('/usuarios/perfil/foto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setSucesso('Foto atualizada com sucesso!')
      // Recarregar perfil após um pequeno delay para garantir que o servidor processou
      setTimeout(() => {
        carregarPerfil()
      }, 500)
    } catch (error) {
      console.error('Erro ao atualizar foto:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Erro ao atualizar foto'
      setErro(typeof errorMessage === 'string' ? errorMessage : 'Erro ao atualizar foto')
    } finally {
      setLoadingFoto(false)
    }
  }

  const handleCancelCrop = () => {
    setShowCropper(false)
    setImageToCrop(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Carregando perfil...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Editor Modal */}
      {showCropper && imageToCrop && (
        <ImageEditor
          image={imageToCrop}
          onSave={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={1}
        />
      )}

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
              <h1 className="text-3xl font-bold text-white">Gerenciamento de Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Mensagens */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center space-x-2">
            <FaCheck />
            <span>{sucesso}</span>
          </div>
        )}

        {/* Informações do Usuário */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-2 border-red-600">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {fotoPreview ? (
              <button
                onClick={handleFotoClick}
                disabled={loadingFoto}
                className="flex-shrink-0 relative group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
                title="Clique para alterar foto"
              >
                <img
                  src={fotoPreview}
                  alt={usuario.nome || 'Usuário'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-red-600 shadow-lg transition-all group-hover:border-red-500 group-hover:shadow-xl"
                  onError={(e) => {
                    console.error('Erro ao carregar foto:', fotoPreview)
                    e.target.style.display = 'none'
                    setFotoPreview(null)
                  }}
                />
                {loadingFoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-300 flex items-center justify-center">
                  <div className="bg-red-600 rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={handleFotoClick}
                disabled={loadingFoto}
                className="bg-red-600 rounded-full p-6 flex-shrink-0 shadow-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative group hover:scale-110 hover:shadow-2xl"
                title="Clique para adicionar foto"
              >
                <FaUser className="text-white text-4xl transition-opacity group-hover:opacity-0 duration-300" />
                {loadingFoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <FaCamera className="text-red-600 text-2xl" />
                  </div>
                </div>
              </button>
            )}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-3">
                <span className="inline-block bg-red-100 text-red-700 text-xs uppercase tracking-wide font-bold px-3 py-1 rounded-full">
                  {usuario.roleDescricao || usuario.role || 'Usuário'}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-black mb-3 break-words">
                {usuario.nome || 'Administrador'}
              </h2>
              <div className="flex items-center justify-center md:justify-start space-x-2 bg-gray-50 rounded-lg p-3">
                <FaEnvelope className="text-red-600 flex-shrink-0" />
                <p className="text-lg text-gray-800 font-semibold break-all">
                  {usuario.email || 'Carregando email...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Atualizar Email */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-red-600 text-xl" />
              <h3 className="text-xl font-bold text-black">Atualizar Email</h3>
            </div>
            <button
              onClick={() => {
                setShowEmailForm(!showEmailForm)
                setErro('')
                setSucesso('')
              }}
              className="btn-primary"
            >
              {showEmailForm ? 'Cancelar' : 'Alterar Email'}
            </button>
          </div>

          {showEmailForm && (
            <form onSubmit={handleAtualizarEmail} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Email
                </label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={senhaAtualEmail}
                  onChange={(e) => setSenhaAtualEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loadingEmail}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loadingEmail ? 'Atualizando...' : 'Atualizar Email'}
              </button>
            </form>
          )}
        </div>

        {/* Atualizar Senha */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaLock className="text-red-600 text-xl" />
              <h3 className="text-xl font-bold text-black">Atualizar Senha</h3>
            </div>
            <button
              onClick={() => {
                setShowSenhaForm(!showSenhaForm)
                setErro('')
                setSucesso('')
              }}
              className="btn-primary"
            >
              {showSenhaForm ? 'Cancelar' : 'Alterar Senha'}
            </button>
          </div>

          {showSenhaForm && (
            <form onSubmit={handleAtualizarSenha} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loadingSenha}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loadingSenha ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default Perfil

