import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { setToken, setUserRole, setUserEmpresaId, setUserEmpresaNome, setSelectedEmpresaId } from '../utils/auth'
import Logo from '../components/Logo'
import { useTranslation } from '../hooks/useTranslation'

function Register({ setIsAuthenticated }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    // Validações
    if (senha !== confirmarSenha) {
      setErro(t('register.passwordMismatch'))
      return
    }

    if (senha.length < 6) {
      setErro(t('register.passwordMinLength'))
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
                          t('register.error')
      setErro(typeof errorMessage === 'string' ? errorMessage : t('register.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo className="text-red-600" size="xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">BANCO AI</h1>
          <p className="text-gray-400 text-sm md:text-base">{t('register.title')}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6 text-center">{t('register.adminAccount')}</h2>
          
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-black mb-2">
                {t('register.fullName')}
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder={t('register.fullNamePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                {t('register.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder={t('register.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-black mb-2">
                {t('register.companyName')}
              </label>
              <input
                type="text"
                id="nomeEmpresa"
                value={nomeEmpresa}
                onChange={(e) => setNomeEmpresa(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder={t('register.companyNamePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-black mb-2">
                {t('register.password')}
              </label>
              <input
                type="password"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder={t('register.passwordPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-black mb-2">
                {t('register.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder={t('register.confirmPasswordPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-600">
              {t('register.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                {t('register.doLogin')}
              </button>
            </p>
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate('/recursos')}
                className="text-red-600 hover:text-red-700 hover:underline"
              >
                {t('register.viewResources')}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center text-xs md:text-sm text-gray-600">
            <p className="font-semibold">{t('register.willBeAdmin')}</p>
            <p className="text-red-600 font-bold">{t('register.adminRole')}</p>
            <p className="mt-2">{t('register.companyCreated')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register

