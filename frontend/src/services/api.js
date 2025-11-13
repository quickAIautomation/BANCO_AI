import axios from 'axios'
import { removeToken, getToken } from '../utils/auth'

// Usa variável de ambiente ou fallback para localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Exportar URL base para uso em componentes (ex: imagens)
export const getApiBaseUrl = () => {
  // Remove /api do final se existir, pois as rotas de imagens não precisam
  return API_BASE_URL.replace('/api', '')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos de timeout
})

// Flag para evitar múltiplos redirecionamentos
let isRedirecting = false

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    // Se não tem token, não adiciona header (mas deixa a requisição prosseguir para o backend retornar 401)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erro 401 (Não autorizado - token expirado ou inválido)
    if (error.response?.status === 401) {
      // Evitar múltiplos redirecionamentos
      if (!isRedirecting) {
        isRedirecting = true
        removeToken()
        
        // Limpar qualquer estado da aplicação
        console.warn('Token expirado ou inválido. Redirecionando para login...')
        
        // Usar window.location para garantir que toda a aplicação seja recarregada
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
    
    // Tratar erro de timeout ou conexão
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Erro de conexão com o servidor')
    }
    
    return Promise.reject(error)
  }
)

export default api

