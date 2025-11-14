import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaCar, FaBars, FaTimes, FaPlus, FaUser, FaBuilding, FaKey, FaSignOutAlt, FaBell, FaArrowLeft, FaCog } from 'react-icons/fa'
import { useNotification } from '../contexts/NotificationContext'

function Header({ 
  title = 'BANCO AI', 
  icon: Icon = FaCar,
  userRole,
  empresas = [],
  empresaSelecionada,
  onEmpresaChange,
  canCreateCarro = false,
  canManageEmpresas = false,
  onNovoCarro,
  onLogout,
  customButtons = null,
  showBackButton = false,
  backTo = '/dashboard'
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [empresaMenuOpen, setEmpresaMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { history } = useNotification()
  const unreadCount = history.length > 0 ? history.length : 0
  const userMenuRefDesktop = useRef(null)
  const userMenuRefMobile = useRef(null)
  const empresaMenuRef = useRef(null)
  
  // Determinar se deve mostrar botão de voltar (não mostrar no dashboard)
  const shouldShowBack = showBackButton && location.pathname !== '/dashboard'

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = !userMenuRefDesktop.current || !userMenuRefDesktop.current.contains(event.target)
      const clickedOutsideMobile = !userMenuRefMobile.current || !userMenuRefMobile.current.contains(event.target)
      const clickedOutsideEmpresa = !empresaMenuRef.current || !empresaMenuRef.current.contains(event.target)
      
      // Se clicou fora de ambos (ou um não existe), fecha o menu
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setUserMenuOpen(false)
      }
      
      if (clickedOutsideEmpresa) {
        setEmpresaMenuOpen(false)
      }
    }

    if (userMenuOpen || empresaMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen, empresaMenuOpen])
  
  const empresaSelecionadaObj = empresas.find(e => e.id === empresaSelecionada)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="bg-black border-b-2 border-red-600">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Título */}
          <div className="flex items-center space-x-3">
            {shouldShowBack && (
              <button
                onClick={() => navigate(backTo)}
                className="text-white hover:text-red-600 transition-colors"
                aria-label="Voltar"
              >
                <FaArrowLeft className="text-2xl" />
              </button>
            )}
            <Icon className="text-red-600 text-2xl md:text-3xl" />
            <h1 className="text-xl md:text-3xl font-bold text-white">{title}</h1>
          </div>

          {/* Menu Desktop - Oculto em mobile */}
          <div className="hidden md:flex items-center space-x-2 md:space-x-4">
            {customButtons ? (
              customButtons
            ) : (
              <>
                {userRole === 'ADMIN' && empresas.length > 0 && (
                  <div className="relative" ref={empresaMenuRef}>
                    <button
                      onClick={() => setEmpresaMenuOpen(!empresaMenuOpen)}
                      className="btn-secondary flex items-center space-x-2 text-sm px-3 py-2"
                    >
                      <FaBuilding className="text-red-600" />
                      <span className="max-w-[150px] truncate">
                        {empresaSelecionadaObj?.nome || 'Selecionar Empresa'}
                      </span>
                    </button>
                    
                    {empresaMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px] max-w-[300px]">
                        {empresas.map((empresa) => (
                          <button
                            key={empresa.id}
                            onClick={() => {
                              onEmpresaChange && onEmpresaChange(empresa.id)
                              setEmpresaMenuOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                              empresa.id === empresaSelecionada
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                            } ${empresas.indexOf(empresa) === 0 ? 'rounded-t-lg' : ''} ${
                              empresas.indexOf(empresa) === empresas.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                          >
                            <FaBuilding className={empresa.id === empresaSelecionada ? 'text-white' : 'text-red-600'} />
                            <span className="truncate">{empresa.nome}</span>
                            {empresa.id === empresaSelecionada && (
                              <span className="ml-auto text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {canCreateCarro && (
                  <button
                    onClick={onNovoCarro}
                    className="btn-primary flex items-center space-x-2 text-sm px-3 py-2"
                  >
                    <FaPlus />
                    <span className="hidden lg:inline">Novo Carro</span>
                  </button>
                )}
                {canManageEmpresas && (
                  <button
                    onClick={() => navigate('/empresas')}
                    className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm"
                  >
                    <FaBuilding />
                    <span className="hidden lg:inline">Empresas</span>
                  </button>
                )}
                {/* Menu Hambúrguer para Notificações, Perfil, Configurações e Sair */}
                <div className="relative" ref={userMenuRefDesktop}>
                  <button
                    onClick={toggleUserMenu}
                    className="text-white hover:text-red-600 transition-colors p-2"
                    aria-label="Menu do usuário"
                  >
                    <FaBars className="text-xl" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-[60] user-menu-dropdown">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/notificacoes')
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 relative user-menu-item"
                        >
                          <FaBell />
                          <span>Notificações</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            navigate('/perfil')
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                        >
                          <FaUser />
                          <span>Perfil</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/configuracoes')
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                        >
                          <FaCog />
                          <span>Configurações</span>
                        </button>
                        <div className="border-t border-gray-800 my-1 user-menu-divider"></div>
                        <button
                          onClick={() => {
                            handleLogout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                        >
                          <FaSignOutAlt />
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Menu Hambúrguer do Usuário no Mobile também */}
            <div className="relative" ref={userMenuRefMobile}>
              <button
                onClick={toggleUserMenu}
                className="text-white hover:text-red-600 transition-colors p-2"
                aria-label="Menu do usuário"
              >
                <FaBars className="text-2xl" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-[60] user-menu-dropdown">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/notificacoes')
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 relative user-menu-item"
                    >
                      <FaBell />
                      <span>Notificações</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/perfil')
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                    >
                      <FaUser />
                      <span>Perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/configuracoes')
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                    >
                      <FaCog />
                      <span>Configurações</span>
                    </button>
                    <div className="border-t border-gray-800 my-1 user-menu-divider"></div>
                    <button
                      onClick={() => {
                        handleLogout()
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left text-white hover:bg-gray-800 flex items-center space-x-2 px-4 py-2 user-menu-item"
                    >
                      <FaSignOutAlt />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Menu Principal Mobile */}
            <button
              onClick={toggleMenu}
              className="text-white hover:text-red-600 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile - Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col space-y-3">
              {shouldShowBack && (
                <button
                  onClick={() => {
                    navigate(backTo)
                    setMenuOpen(false)
                  }}
                  className="w-full text-left text-white hover:text-red-600 flex items-center space-x-2 px-4 py-2 transition-colors"
                >
                  <FaArrowLeft />
                  <span>Voltar</span>
                </button>
              )}
              {customButtons ? (
                <div className="flex flex-col space-y-2" onClick={() => setMenuOpen(false)}>
                  {customButtons}
                </div>
              ) : (
                <>
                  {userRole === 'ADMIN' && empresas.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setEmpresaMenuOpen(!empresaMenuOpen)
                        }}
                        className="btn-secondary flex items-center space-x-2 w-full justify-between text-sm px-3 py-2"
                      >
                        <div className="flex items-center space-x-2">
                          <FaBuilding className="text-red-600" />
                          <span className="truncate">
                            {empresaSelecionadaObj?.nome || 'Selecionar Empresa'}
                          </span>
                        </div>
                      </button>
                      
                      {empresaMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setEmpresaMenuOpen(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20">
                            {empresas.map((empresa) => (
                              <button
                                key={empresa.id}
                                onClick={() => {
                                  onEmpresaChange && onEmpresaChange(empresa.id)
                                  setEmpresaMenuOpen(false)
                                  setMenuOpen(false)
                                }}
                                className={`w-full text-left px-4 py-3 flex items-center space-x-2 transition-colors ${
                                  empresa.id === empresaSelecionada
                                    ? 'bg-red-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                                } ${empresas.indexOf(empresa) === 0 ? 'rounded-t-lg' : ''} ${
                                  empresas.indexOf(empresa) === empresas.length - 1 ? 'rounded-b-lg' : ''
                                }`}
                              >
                                <FaBuilding className={empresa.id === empresaSelecionada ? 'text-white' : 'text-red-600'} />
                                <span className="truncate flex-1">{empresa.nome}</span>
                                {empresa.id === empresaSelecionada && (
                                  <span className="text-xs">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {canCreateCarro && (
                          <button
                            onClick={() => {
                              onNovoCarro && onNovoCarro()
                              setMenuOpen(false)
                            }}
                            className="btn-primary flex items-center space-x-2 w-full justify-center"
                          >
                            <FaPlus />
                            <span>Novo Carro</span>
                          </button>
                  )}
                  {canManageEmpresas && (
                    <button
                      onClick={() => {
                        navigate('/empresas')
                        setMenuOpen(false)
                      }}
                      className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 py-2"
                    >
                      <FaBuilding />
                      <span>Empresas</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

