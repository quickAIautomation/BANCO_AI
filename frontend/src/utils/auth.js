const TOKEN_KEY = 'banco_ai_token'
const USER_ROLE_KEY = 'banco_ai_user_role'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
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

export const getAuthHeader = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

