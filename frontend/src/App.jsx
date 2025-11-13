import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Recursos from './pages/Recursos'
import Dashboard from './pages/Dashboard'
import Perfil from './pages/Perfil'
import Empresas from './pages/Empresas'
import Usuarios from './pages/Usuarios'
import Configuracoes from './pages/Configuracoes'
import EsqueceuSenha from './pages/EsqueceuSenha'
import ResetSenha from './pages/ResetSenha'
import { getToken } from './utils/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    setIsAuthenticated(!!token)
    setLoading(false)
    
    // Verificar periodicamente se o token ainda existe (a cada 5 minutos)
    // Isso ajuda a detectar se o token foi removido em outra aba ou pelo interceptor
    const interval = setInterval(() => {
      const currentToken = getToken()
      if (!currentToken) {
        setIsAuthenticated(false)
      }
    }, 5 * 60 * 1000) // 5 minutos
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/recursos" 
          element={<Recursos />} 
        />
        <Route 
          path="/esqueceu-senha" 
          element={<EsqueceuSenha />} 
        />
        <Route 
          path="/reset-senha" 
          element={<ResetSenha />} 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/perfil" 
          element={
            isAuthenticated ? <Perfil setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/empresas" 
          element={
            isAuthenticated ? <Empresas setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            isAuthenticated ? <Usuarios setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            isAuthenticated ? <Configuracoes setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/recursos" />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

