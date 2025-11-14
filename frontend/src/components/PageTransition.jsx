import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function PageTransition({ children }) {
  const location = useLocation()

  useEffect(() => {
    // Scroll suave para o topo ao mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="page-transition page-transition-fadeIn" style={{ background: 'transparent' }}>
      {children}
    </div>
  )
}

export default PageTransition

