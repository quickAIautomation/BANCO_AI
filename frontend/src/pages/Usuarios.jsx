import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { FaUsers, FaSignOutAlt, FaPlus, FaUser, FaSearch, FaEdit, FaTrash, FaTimes, FaBuilding } from 'react-icons/fa'
import { removeToken } from '../utils/auth'

function Usuarios({ setIsAuthenticated }) {
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [showFiltros, setShowFiltros] = useState(false)
  const [filtros, setFiltros] = useState({
    nome: '',
    email: '',
    empresaId: null,
    role: null,
    ativo: null,
    ordenarPor: 'nome',
    direcao: 'ASC',
    pagina: 0,
    tamanho: 20
  })
  const [totalPages, setTotalPages] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    carregarUsuarios()
    carregarEmpresas()
  }, [])

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios/todos?pagina=0&tamanho=100')
      setUsuarios(response.data.content || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setLoading(false)
    }
  }

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas')
      setEmpresas(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const buscarComFiltros = async () => {
    try {
      setLoading(true)
      const response = await api.post('/usuarios/buscar', filtros)
      setUsuarios(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleNovoUsuario = () => {
    setUsuarioEditando(null)
    setShowForm(true)
  }

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setUsuarioEditando(null)
    carregarUsuarios()
  }

  const handleAlterarRole = async (usuarioId, novoRole) => {
    try {
      await api.put(`/usuarios/${usuarioId}/role`, novoRole)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar permissão:', error)
      alert('Erro ao alterar permissão')
    }
  }

  const handleAtivarDesativar = async (usuarioId, ativo) => {
    try {
      await api.put(`/usuarios/${usuarioId}/ativo`, !ativo)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status')
    }
  }

  const handleFiltroChange = (field, value) => {
    setFiltros({ ...filtros, [field]: value === '' ? null : value, pagina: 0 })
  }

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      email: '',
      empresaId: null,
      role: null,
      ativo: null,
      ordenarPor: 'nome',
      direcao: 'ASC',
      pagina: 0,
      tamanho: 20
    })
    carregarUsuarios()
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b-2 border-red-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-red-600 text-3xl" />
              <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white hover:text-red-600 transition-colors"
              >
                Carros
              </button>
              <button
                onClick={() => navigate('/empresas')}
                className="text-white hover:text-red-600 transition-colors"
              >
                Empresas
              </button>
              <button
                onClick={handleNovoUsuario}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <FaPlus />
                <span>Novo Usuário</span>
              </button>
              <button
                onClick={() => navigate('/perfil')}
                className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors"
              >
                <FaUser />
                <span>Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-red-600 flex items-center space-x-2 transition-colors"
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2 mb-4"
          >
            <FaSearch />
            <span>{showFiltros ? 'Ocultar' : 'Mostrar'} Filtros</span>
          </button>

          {showFiltros && (
            <div className="bg-gray-900 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={filtros.nome}
                  onChange={(e) => handleFiltroChange('nome', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Email"
                  value={filtros.email}
                  onChange={(e) => handleFiltroChange('email', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                />
                <select
                  value={filtros.empresaId || ''}
                  onChange={(e) => handleFiltroChange('empresaId', e.target.value ? parseInt(e.target.value) : null)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="">Todas as Empresas</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
                  ))}
                </select>
                <select
                  value={filtros.role || ''}
                  onChange={(e) => handleFiltroChange('role', e.target.value || null)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="">Todos os Perfis</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="OPERADOR">Operador</option>
                  <option value="VISUALIZADOR">Visualizador</option>
                </select>
                <select
                  value={filtros.ativo === null ? '' : filtros.ativo}
                  onChange={(e) => handleFiltroChange('ativo', e.target.value === '' ? null : e.target.value === 'true')}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) => handleFiltroChange('ordenarPor', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="nome">Nome</option>
                  <option value="email">Email</option>
                </select>
                <select
                  value={filtros.direcao}
                  onChange={(e) => handleFiltroChange('direcao', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="ASC">Crescente</option>
                  <option value="DESC">Decrescente</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={buscarComFiltros}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Buscar
                </button>
                <button
                  onClick={limparFiltros}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-center text-white">
            <p className="text-xl mb-4">Nenhum usuário cadastrado ainda.</p>
            <button
              onClick={handleNovoUsuario}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Cadastrar Primeiro Usuário
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{usuario.nome}</h3>
                    <p className="text-gray-400 text-sm">{usuario.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${usuario.ativo ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="space-y-2 text-gray-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getRoleColor(usuario.role)} text-white`}>
                      {usuario.roleDescricao || usuario.role}
                    </span>
                  </div>
                  {usuario.empresaNome && (
                    <p className="flex items-center space-x-2">
                      <FaBuilding className="text-gray-400" />
                      <span>{usuario.empresaNome}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <select
                    value={usuario.role}
                    onChange={(e) => handleAlterarRole(usuario.id, e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="OPERADOR">Operador</option>
                    <option value="VISUALIZADOR">Visualizador</option>
                  </select>
                  <button
                    onClick={() => handleAtivarDesativar(usuario.id, usuario.ativo)}
                    className={`w-full px-4 py-2 rounded-md text-white ${
                      usuario.ativo ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {usuario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <UsuarioForm
          usuario={usuarioEditando}
          empresas={empresas}
          onClose={handleFormClose}
          onSuccess={carregarUsuarios}
        />
      )}
    </div>
  )
}

function UsuarioForm({ usuario, empresas, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'OPERADOR',
    empresaId: empresas.length > 0 ? empresas[0].id : null
  })

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        role: usuario.role || 'OPERADOR',
        empresaId: usuario.empresaId || null
      })
    }
  }, [usuario, empresas])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (usuario) {
        // Para edição, apenas atualizar role e empresa se necessário
        if (formData.role !== usuario.role) {
          await api.put(`/usuarios/${usuario.id}/role`, formData.role)
        }
      } else {
        await api.post('/usuarios', formData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário: ' + (error.response?.data || error.message))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {usuario ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-red-600">
            <FaTimes className="text-2xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome *"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            disabled={!!usuario}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
          />
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={!!usuario}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
          />
          {!usuario && (
            <input
              type="password"
              placeholder="Senha *"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
            />
          )}
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md"
          >
            <option value="ADMIN">Administrador</option>
            <option value="OPERADOR">Operador</option>
            <option value="VISUALIZADOR">Visualizador</option>
          </select>
          <select
            value={formData.empresaId || ''}
            onChange={(e) => setFormData({ ...formData, empresaId: e.target.value ? parseInt(e.target.value) : null })}
            required
            disabled={!!usuario}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            <option value="">Selecione uma empresa</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>{empresa.nome}</option>
            ))}
          </select>
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

export default Usuarios

