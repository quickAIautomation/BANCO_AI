import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUserRole, setUserEmpresaId, setUserEmpresaNome, setSelectedEmpresaId } from '../utils/auth'
import { FaCar } from 'react-icons/fa'

function Register({ setIsAuthenticated }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    // Validações
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha,
        nomeEmpresa
      })
      
      console.log('Register response:', response.data)
      
      // Salvar token e dados do usuário
      setToken(response.data.token)
      if (response.data.role) {
        setUserRole(response.data.role)
      }
      if (response.data.empresaId) {
        setUserEmpresaId(response.data.empresaId)
        setSelectedEmpresaId(response.data.empresaId)
      }
      if (response.data.empresaNome) {
        setUserEmpresaNome(response.data.empresaNome)
      }
      
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (error) {
      console.error('Register error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Erro ao criar conta. Tente novamente.'
      setErro(typeof errorMessage === 'string' ? errorMessage : 'Erro ao criar conta. Tente novamente.')
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
          <p className="text-gray-400 text-sm md:text-base">Criar Nova Conta</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6 text-center">Criar Conta Administrador</h2>
          
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-black mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-black mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                id="nomeEmpresa"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-black mb-2">
                Senha *
              </label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-black mb-2">
                Confirmar Senha *
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
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                Fazer Login
              </button>
            </p>
          </div>

          <div className="mt-4 text-center text-xs md:text-sm text-gray-600">
            <p className="font-semibold">Ao criar a conta, você será:</p>
            <p className="text-red-600 font-bold">Administrador (ADMIN)</p>
            <p className="mt-2">Uma nova empresa será criada automaticamente com o nome informado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

