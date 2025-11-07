import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { FaCar, FaArrowLeft } from 'react-icons/fa'

function EsqueceuSenha() {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSucesso(false)
    setLoading(true)

    try {
      await api.post('/auth/esqueceu-senha', { email })
      setSucesso(true)
    } catch (error) {
      setErro(error.response?.data || 'Erro ao enviar email. Verifique se o email está correto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaCar className="text-red-600 text-6xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">BANCO AI</h1>
          <p className="text-gray-400">Redefinição de Senha</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={() => navigate('/login')}
            className="mb-4 text-gray-600 hover:text-red-600 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Voltar para login</span>
          </button>

          <h2 className="text-2xl font-bold text-black mb-6 text-center">Esqueceu sua senha?</h2>
          
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {erro}
            </div>
          )}

          {sucesso ? (
            <div className="text-center">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Email enviado com sucesso!</p>
                <p className="text-sm mt-2">
                  Verifique sua caixa de entrada. Enviamos um link para redefinir sua senha.
                  O link expira em 1 hora.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Voltar para login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  Digite seu email cadastrado
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                  placeholder="seu-email@exemplo.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default EsqueceuSenha

