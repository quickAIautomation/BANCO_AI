import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUserRole, setUserEmpresaId, setUserEmpresaNome, setSelectedEmpresaId } from '../utils/auth'
import { FaCar } from 'react-icons/fa'

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { email, senha })
      console.log('Login response:', response.data)
      setToken(response.data.token)
      if (response.data.role) {
        setUserRole(response.data.role)
      }
      if (response.data.empresaId) {
        setUserEmpresaId(response.data.empresaId)
      }
      if (response.data.empresaNome) {
        setUserEmpresaNome(response.data.empresaNome)
      }
      // Se for admin, inicializar com a empresa do usuário
      if (response.data.role === 'ADMIN' && response.data.empresaId) {
        setSelectedEmpresaId(response.data.empresaId)
      }
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')
      
      // Mostrar mensagem de erro do backend ou mensagem genérica
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Credenciais inválidas. Tente novamente.'
      setErro(typeof errorMessage === 'string' ? errorMessage : 'Credenciais inválidas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaCar className="text-red-600 text-4xl md:text-6xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">BANCO AI</h1>
          <p className="text-gray-400 text-sm md:text-base">Sistema de Gerenciamento de Carros</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6 text-center">Login Administrador</h2>
          
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="admin@bancoai.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-black mb-2">
                Senha
              </label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/esqueceu-senha')}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Esqueceu a senha?
            </button>
          </div>

          <div className="mt-6 text-center text-xs md:text-sm text-gray-600">
            <p>Credenciais padrão:</p>
            <p className="font-mono text-xs md:text-sm break-all">admin@bancoai.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

