import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { FaCar, FaLock } from 'react-icons/fa'

function ResetSenha() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setErro('Token inválido ou ausente. Por favor, solicite um novo link de redefinição.')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-senha', {
        token,
        novaSenha
      })
      setSucesso(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setErro(error.response?.data || 'Erro ao redefinir senha. O token pode estar expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-600 mb-4">
              <FaLock className="text-6xl mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">Token Inválido</h2>
            <p className="text-gray-600 mb-6">
              O link de redefinição de senha é inválido ou expirou.
              Por favor, solicite um novo link.
            </p>
            <button
              onClick={() => navigate('/esqueceu-senha')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Solicitar novo link
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaCar className="text-red-600 text-6xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BANCO AI</h1>
          <p className="text-gray-400">Redefinir Senha</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {sucesso ? (
            <div className="text-center">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Senha redefinida com sucesso!</p>
                <p className="text-sm mt-2">Você será redirecionado para a página de login em instantes...</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black mb-6 text-center">Defina sua nova senha</h2>
              
              {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="novaSenha" className="block text-sm font-medium text-black mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="novaSenha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-black mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                    placeholder="Digite a senha novamente"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetSenha

