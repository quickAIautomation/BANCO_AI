import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import { FaBuilding, FaPlus, FaUser, FaEdit, FaTrash, FaTimes, FaUsers, FaShieldAlt, FaUserShield, FaUserCheck, FaUserTimes, FaChevronDown, FaChevronUp, FaCar, FaSignOutAlt } from 'react-icons/fa'
import { removeToken, getUserRole } from '../utils/auth'
import { canCreateEmpresa, canEditEmpresa, canDeleteEmpresa, canManageUsuarios } from '../utils/permissions'

function Empresas({ setIsAuthenticated }) {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState(null)
  const [empresaExpandida, setEmpresaExpandida] = useState(null)
  const [usuariosEmpresa, setUsuariosEmpresa] = useState({})
  const [showFormUsuario, setShowFormUsuario] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
    carregarEmpresas()
  }, [])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas')
      setEmpresas(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      setLoading(false)
    }
  }

  const carregarUsuariosEmpresa = async (empresaId) => {
    try {
      const response = await api.get(`/usuarios/empresa/${empresaId}`)
      setUsuariosEmpresa(prev => ({ ...prev, [empresaId]: response.data }))
    } catch (error) {
      console.error('Erro ao carregar usuários da empresa:', error)
      setUsuariosEmpresa(prev => ({ ...prev, [empresaId]: [] }))
    }
  }

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleNovaEmpresa = () => {
    setEmpresaEditando(null)
    setShowForm(true)
  }

  const handleEditarEmpresa = (empresa) => {
    setEmpresaEditando(empresa)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEmpresaEditando(null)
    carregarEmpresas()
  }

  const handleDeletarEmpresa = async (id) => {
    if (window.confirm('Tem certeza que deseja desativar esta empresa?')) {
      try {
        await api.delete(`/empresas/${id}`)
        carregarEmpresas()
      } catch (error) {
        console.error('Erro ao deletar empresa:', error)
        alert('Erro ao deletar empresa')
      }
    }
  }

  const handleRemoverEmpresa = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja REMOVER permanentemente a empresa "${nome}"?\n\nEsta ação não pode ser desfeita.\n\nIMPORTANTE: A empresa não pode ter carros ou usuários associados.`)) {
      try {
        await api.delete(`/empresas/${id}/remover`)
        carregarEmpresas()
        alert('Empresa removida com sucesso')
      } catch (error) {
        console.error('Erro ao remover empresa:', error)
        const errorMessage = error.response?.data || error.message || 'Erro ao remover empresa'
        alert(typeof errorMessage === 'string' ? errorMessage : 'Erro ao remover empresa')
      }
    }
  }

  const handleExpandirEmpresa = (empresaId) => {
    if (empresaExpandida === empresaId) {
      setEmpresaExpandida(null)
    } else {
      setEmpresaExpandida(empresaId)
      if (!usuariosEmpresa[empresaId]) {
        carregarUsuariosEmpresa(empresaId)
      }
    }
  }

  const handleNovoUsuario = (empresaId) => {
    setEmpresaSelecionada(empresaId)
    setUsuarioEditando(null)
    setShowFormUsuario(true)
  }

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario)
    setEmpresaSelecionada(usuario.empresaId)
    setShowFormUsuario(true)
  }

  const handleFormUsuarioClose = () => {
    setShowFormUsuario(false)
    setUsuarioEditando(null)
    setEmpresaSelecionada(null)
    if (empresaExpandida) {
      carregarUsuariosEmpresa(empresaExpandida)
    }
  }

  const handleAlterarRole = async (usuarioId, novoRole) => {
    try {
      await api.put(`/usuarios/${usuarioId}/role`, novoRole)
      if (empresaExpandida) {
        carregarUsuariosEmpresa(empresaExpandida)
      }
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
      alert('Erro ao alterar permissão')
    }
  }

  const handleAtivarDesativar = async (usuarioId, ativo) => {
    try {
      await api.put(`/usuarios/${usuarioId}/ativo`, !ativo)
      if (empresaExpandida) {
        carregarUsuariosEmpresa(empresaExpandida)
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <FaShieldAlt className="text-red-600" />
      case 'OPERADOR':
        return <FaUserShield className="text-blue-600" />
      case 'VISUALIZADOR':
        return <FaUserCheck className="text-green-600" />
      default:
        return <FaUser className="text-gray-400" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600'
      case 'OPERADOR':
        return 'bg-blue-600'
      case 'VISUALIZADOR':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const customButtons = (
    <>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm md:text-base py-2 md:py-0"
      >
        <FaCar />
        <span>Carros</span>
      </button>
      {canCreateEmpresa(userRole) && (
        <button
          onClick={handleNovaEmpresa}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors text-sm md:text-base w-full md:w-auto justify-center"
        >
          <FaPlus />
          <span>Nova Empresa</span>
        </button>
      )}
      <button
        onClick={() => navigate('/perfil')}
        className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm md:text-base py-2 md:py-0"
      >
        <FaUser />
        <span>Perfil</span>
      </button>
      <button
        onClick={handleLogout}
        className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors text-sm md:text-base py-2 md:py-0"
      >
        <FaSignOutAlt />
        <span>Sair</span>
      </button>
    </>
  )

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header
        title="Gerenciar Empresas"
        icon={FaBuilding}
        customButtons={customButtons}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-white text-xl">Carregando empresas...</div>
        ) : empresas.length === 0 ? (
          <div className="text-center text-white">
            <p className="text-xl mb-4">Nenhuma empresa cadastrada ainda.</p>
            <button
              onClick={handleNovaEmpresa}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Cadastrar Primeira Empresa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {empresas.map((empresa) => (
              <div key={empresa.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                {/* Cabeçalho da Empresa */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <FaBuilding className="text-red-600 text-2xl" />
                      <h3 className="text-xl font-bold text-white">{empresa.nome}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${empresa.ativa ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {empresa.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <div className="space-y-1 text-gray-300 ml-0 md:ml-10">
                      {empresa.cnpj && <p><strong>CNPJ:</strong> {empresa.cnpj}</p>}
                      {empresa.email && (
                        <p className="flex items-center space-x-2">
                          <FaUser className="text-gray-400" />
                          <span><strong>Email:</strong> {empresa.email}</span>
                        </p>
                      )}
                      {empresa.telefone && <p><strong>Telefone:</strong> {empresa.telefone}</p>}
                      {empresa.endereco && <p><strong>Endereço:</strong> {empresa.endereco}</p>}
                      {empresa.dataCadastro && <p className="text-sm text-gray-400">Cadastrado em: {empresa.dataCadastro}</p>}
                    </div>
                  </div>
                  {(canEditEmpresa(userRole) || canDeleteEmpresa(userRole)) && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      {canEditEmpresa(userRole) && (
                        <button
                          onClick={() => handleEditarEmpresa(empresa)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                        >
                          <FaEdit />
                          <span>Editar</span>
                        </button>
                      )}
                      {canDeleteEmpresa(userRole) && (
                        <>
                          <button
                            onClick={() => handleDeletarEmpresa(empresa.id)}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center justify-center space-x-2 transition-colors"
                          >
                            <FaTrash />
                            <span>Desativar</span>
                          </button>
                          <button
                            onClick={() => handleRemoverEmpresa(empresa.id, empresa.nome)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors"
                          >
                            <FaTrash />
                            <span>Remover</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Botão para expandir/colapsar usuários */}
                <button
                  onClick={() => handleExpandirEmpresa(empresa.id)}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-red-600" />
                    <span>Usuários da Empresa</span>
                  </div>
                  {empresaExpandida === empresa.id ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {/* Lista de Usuários (expandida) */}
                {empresaExpandida === empresa.id && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <FaUsers className="text-red-600" />
                        <span>Usuários</span>
                      </h4>
                      {canManageUsuarios(userRole) && (
                        <button
                          onClick={() => handleNovoUsuario(empresa.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 flex items-center space-x-2 text-sm"
                        >
                          <FaPlus />
                          <span>Novo Usuário</span>
                        </button>
                      )}
                    </div>
                    
                    {usuariosEmpresa[empresa.id] && usuariosEmpresa[empresa.id].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {usuariosEmpresa[empresa.id].map((usuario) => (
                          <div key={usuario.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {getRoleIcon(usuario.role)}
                                  <h5 className="font-semibold text-white">{usuario.nome}</h5>
                                </div>
                                <p className="text-gray-400 text-sm">{usuario.email}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${usuario.ativo ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                                {usuario.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <span className={`px-2 py-1 rounded text-xs ${getRoleColor(usuario.role)} text-white`}>
                                {usuario.roleDescricao || usuario.role}
                              </span>
                            </div>
                            
                            {canManageUsuarios(userRole) && (
                              <div className="space-y-2">
                                <select
                                  value={usuario.role}
                                  onChange={(e) => handleAlterarRole(usuario.id, e.target.value)}
                                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md text-sm"
                                >
                                  <option value="ADMIN">Administrador</option>
                                  <option value="OPERADOR">Operador</option>
                                  <option value="VISUALIZADOR">Visualizador</option>
                                </select>
                                <button
                                  onClick={() => handleAtivarDesativar(usuario.id, usuario.ativo)}
                                  className={`w-full px-3 py-2 rounded-md text-white text-sm ${
                                    usuario.ativo ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                                  }`}
                                >
                                  {usuario.ativo ? <><FaUserTimes className="inline mr-1" />Desativar</> : <><FaUserCheck className="inline mr-1" />Ativar</>}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        <FaUsers className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>Nenhum usuário cadastrado nesta empresa.</p>
                        {canManageUsuarios(userRole) && (
                          <button
                            onClick={() => handleNovoUsuario(empresa.id)}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                          >
                            Cadastrar Primeiro Usuário
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form Empresa */}
      {showForm && (
        <EmpresaForm
          empresa={empresaEditando}
          onClose={handleFormClose}
          onSuccess={carregarEmpresas}
        />
      )}

      {/* Modal Form Usuário */}
      {showFormUsuario && (
        <UsuarioForm
          usuario={usuarioEditando}
          empresaId={empresaSelecionada}
          onClose={handleFormUsuarioClose}
          onSuccess={() => {
            if (empresaExpandida) {
              carregarUsuariosEmpresa(empresaExpandida)
            }
          }}
        />
      )}
    </div>
  )
}

function EmpresaForm({ empresa, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    email: '',
    ativa: true
  })

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || '',
        cnpj: empresa.cnpj || '',
        endereco: empresa.endereco || '',
        telefone: empresa.telefone || '',
        email: empresa.email || '',
        ativa: empresa.ativa !== undefined ? empresa.ativa : true
      })
    }
  }, [empresa])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (empresa) {
        await api.put(`/empresas/${empresa.id}`, formData)
      } else {
        await api.post('/empresas', formData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      alert('Erro ao salvar empresa')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FaBuilding className="text-red-600" />
            <span>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</span>
          </h2>
          <button onClick={onClose} className="text-white hover:text-red-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <FaBuilding className="text-gray-400" />
            <input
              type="text"
              placeholder="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
            />
          </div>
          <input
            type="text"
            placeholder="CNPJ"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
          />
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
            />
          </div>
          <input
            type="text"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Endereço"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
          />
          {empresa && (
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={formData.ativa}
                onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Empresa Ativa</span>
            </label>
          )}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsuarioForm({ usuario, empresaId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR',
    empresaId: empresaId
  })

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        role: usuario.role || 'OPERADOR',
        empresaId: usuario.empresaId || empresaId
      })
    } else {
      setFormData({
        nome: '',
        email: '',
        senha: '',
        role: 'OPERADOR',
        empresaId: empresaId
      })
    }
  }, [usuario, empresaId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (usuario) {
        // Para edição, apenas atualizar role
        if (formData.role !== usuario.role) {
          await api.put(`/usuarios/${usuario.id}/role`, formData.role)
        }
      } else {
        // Garantir que empresaId está definido
        if (!formData.empresaId) {
          alert('Erro: Empresa não selecionada')
          return
        }
        
        // Enviar dados no formato correto
        const dadosUsuario = {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          role: formData.role,
          empresaId: formData.empresaId
        }
        
        await api.post('/usuarios', dadosUsuario)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      const errorMessage = error.response?.data || error.response?.data?.message || error.message || 'Erro desconhecido'
      alert('Erro ao salvar usuário: ' + errorMessage)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FaUsers className="text-red-600" />
            <span>{usuario ? 'Editar Usuário' : 'Novo Usuário'}</span>
          </h2>
          <button onClick={onClose} className="text-white hover:text-red-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-400" />
            <input
              type="text"
              placeholder="Nome *"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              disabled={!!usuario}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FaUser className="text-gray-400" />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!usuario}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
            />
          </div>
          {!usuario && (
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="text-gray-400" />
              <input
                type="password"
                placeholder="Senha *"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <FaShieldAlt className="text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
            >
              <option value="ADMIN">Administrador</option>
              <option value="OPERADOR">Operador</option>
              <option value="VISUALIZADOR">Visualizador</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Empresas
