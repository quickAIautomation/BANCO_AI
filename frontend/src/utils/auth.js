const TOKEN_KEY = 'banco_ai_token'
const USER_ROLE_KEY = 'banco_ai_user_role'
const USER_EMPRESA_ID_KEY = 'banco_ai_user_empresa_id'
const USER_EMPRESA_NOME_KEY = 'banco_ai_user_empresa_nome'
const SELECTED_EMPRESA_ID_KEY = 'banco_ai_selected_empresa_id'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
  localStorage.removeItem(USER_EMPRESA_ID_KEY)
  localStorage.removeItem(USER_EMPRESA_NOME_KEY)
  localStorage.removeItem(SELECTED_EMPRESA_ID_KEY)
}

export const getUserRole = () => {
  return localStorage.getItem(USER_ROLE_KEY)
}

export const setUserRole = (role) => {
  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role)
  } else {
    localStorage.removeItem(USER_ROLE_KEY)
  }
}

export const getUserEmpresaId = () => {
  const id = localStorage.getItem(USER_EMPRESA_ID_KEY)
  return id ? parseInt(id) : null
}

export const setUserEmpresaId = (empresaId) => {
  if (empresaId) {
    localStorage.setItem(USER_EMPRESA_ID_KEY, empresaId.toString())
  } else {
    localStorage.removeItem(USER_EMPRESA_ID_KEY)
  }
}

export const getUserEmpresaNome = () => {
  return localStorage.getItem(USER_EMPRESA_NOME_KEY)
}

export const setUserEmpresaNome = (empresaNome) => {
  if (empresaNome) {
    localStorage.setItem(USER_EMPRESA_NOME_KEY, empresaNome)
  } else {
    localStorage.removeItem(USER_EMPRESA_NOME_KEY)
  }
}

export const getSelectedEmpresaId = () => {
  const id = localStorage.getItem(SELECTED_EMPRESA_ID_KEY)
  return id ? parseInt(id) : null
}

export const setSelectedEmpresaId = (empresaId) => {
  if (empresaId) {
    localStorage.setItem(SELECTED_EMPRESA_ID_KEY, empresaId.toString())
  } else {
    localStorage.removeItem(SELECTED_EMPRESA_ID_KEY)
  }
}

export const getAuthHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

