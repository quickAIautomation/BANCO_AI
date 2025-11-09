import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCar, FaBars, FaTimes, FaPlus, FaUser, FaBuilding, FaKey, FaSignOutAlt } from 'react-icons/fa'

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
  customButtons = null
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => setMenuOpen(!menuOpen)

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
                  <div className="relative flex items-center space-x-2">
                    <FaBuilding className="text-red-600 text-lg" />
                    <label className="text-white text-sm font-medium hidden lg:inline">Empresa:</label>
                    <select
                      value={empresaSelecionada || ''}
                      onChange={(e) => onEmpresaChange && onEmpresaChange(e.target.value)}
                      className="bg-black text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 transition-all duration-200 cursor-pointer appearance-none pr-8 min-w-[150px] lg:min-w-[200px] text-sm"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '12px'
                      }}
                    >
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id} className="bg-black">
                          {empresa.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {canCreateCarro && (
                  <button
                    onClick={onNovoCarro}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors text-sm"
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
                <button
                  onClick={() => navigate('/perfil')}
                  className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm"
                >
                  <FaUser />
                  <span className="hidden lg:inline">Perfil</span>
                </button>
                <button
                  onClick={() => navigate('/configuracoes')}
                  className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm"
                >
                  <FaKey />
                  <span className="hidden lg:inline">Configurações</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm"
                >
                  <FaSignOutAlt />
                  <span className="hidden lg:inline">Sair</span>
                </button>
              </>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white hover:text-red-600 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Menu Mobile - Dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col space-y-3">
              {customButtons ? (
                <div className="flex flex-col space-y-2" onClick={() => setMenuOpen(false)}>
                  {customButtons}
                </div>
              ) : (
                <>
                  {userRole === 'ADMIN' && empresas.length > 0 && (
                    <div className="flex flex-col space-y-2">
                      <label className="text-white text-sm font-medium flex items-center space-x-2">
                        <FaBuilding className="text-red-600" />
                        <span>Empresa:</span>
                      </label>
                      <select
                        value={empresaSelecionada || ''}
                        onChange={(e) => {
                          onEmpresaChange && onEmpresaChange(e.target.value)
                          setMenuOpen(false)
                        }}
                        className="bg-black text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 w-full"
                      >
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.id} className="bg-black">
                            {empresa.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {canCreateCarro && (
                    <button
                      onClick={() => {
                        onNovoCarro && onNovoCarro()
                        setMenuOpen(false)
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors w-full justify-center"
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
                  <button
                    onClick={() => {
                      navigate('/perfil')
                      setMenuOpen(false)
                    }}
                    className="text-white hover:text-red-600 flex items-center space-x-2 py-2"
                  >
                    <FaUser />
                    <span>Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/configuracoes')
                      setMenuOpen(false)
                    }}
                    className="text-white hover:text-red-600 flex items-center space-x-2 py-2"
                  >
                    <FaKey />
                    <span>Configurações</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMenuOpen(false)
                    }}
                    className="text-white hover:text-red-600 flex items-center space-x-2 py-2"
                  >
                    <FaSignOutAlt />
                    <span>Sair</span>
                  </button>
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

