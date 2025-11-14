import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'
import { FaUsers, FaPlus, FaUser, FaSearch, FaEdit, FaTrash, FaTimes, FaBuilding, FaCar, FaSignOutAlt, FaUpload, FaImage } from 'react-icons/fa'
import { removeToken } from '../utils/auth'
import { useNotification } from '../contexts/NotificationContext'

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
    role: null,
    ativo: null,
    ordenarPor: 'nome',
    direcao: 'ASC',
    pagina: 0,
    tamanho: 20
  })
  const [totalPages, setTotalPages] = useState(0)
  const navigate = useNavigate()
  const { confirm, success, error } = useNotification()

  useEffect(() => {
    carregarUsuarios()
    carregarEmpresas()
  }, [])

  const carregarUsuarios = async () => {
    try {
      // Carregar apenas usuários da própria empresa
      const response = await api.get('/usuarios/empresa')
      setUsuarios(response.data || [])
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
      // Primeiro carregar todos os usuários da empresa
      const response = await api.get('/usuarios/empresa')
      let usuariosFiltrados = response.data || []
      
      // Aplicar filtros localmente (exceto empresaId, pois já está filtrado)
      if (filtros.nome && filtros.nome.trim() !== '') {
        usuariosFiltrados = usuariosFiltrados.filter(u => 
          u.nome.toLowerCase().includes(filtros.nome.toLowerCase())
        )
      }
      if (filtros.email && filtros.email.trim() !== '') {
        usuariosFiltrados = usuariosFiltrados.filter(u => 
          u.email.toLowerCase().includes(filtros.email.toLowerCase())
        )
      }
      if (filtros.role) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.role === filtros.role)
      }
      if (filtros.ativo !== null) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.ativo === filtros.ativo)
      }
      
      // Ordenação
      usuariosFiltrados.sort((a, b) => {
        const campo = filtros.ordenarPor || 'nome'
        const direcao = filtros.direcao || 'ASC'
        let resultado = 0
        
        if (campo === 'nome') {
          resultado = a.nome.localeCompare(b.nome)
        } else if (campo === 'email') {
          resultado = a.email.localeCompare(b.email)
        }
        
        return direcao === 'DESC' ? -resultado : resultado
      })
      
      setUsuarios(usuariosFiltrados)
      setTotalPages(1)
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

  const handleRemoverUsuario = async (usuarioId, nome) => {
    const confirmed = await confirm({
      title: 'Remover Usuário',
      message: `Tem certeza que deseja REMOVER permanentemente o usuário "${nome}"?\n\nEsta ação não pode ser desfeita e irá remover:\n- Todas as API Keys do usuário\n- Todos os relacionamentos com empresas\n- O usuário do sistema`
    })

    if (confirmed) {
      try {
        await api.delete(`/usuarios/${usuarioId}`)
        carregarUsuarios()
        success('Usuário removido', 'O usuário foi removido permanentemente do sistema')
      } catch (err) {
        console.error('Erro ao remover usuário:', err)
        const errorMessage = err.response?.data || err.message || 'Erro ao remover usuário'
        error('Erro ao remover usuário', typeof errorMessage === 'string' ? errorMessage : 'Erro ao remover usuário')
      }
    }
  }

  const handleFiltroChange = (field, value) => {
    setFiltros({ ...filtros, [field]: value === '' ? null : value, pagina: 0 })
  }

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      email: '',
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

  const customButtons = (
    <>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm md:text-base py-2 md:py-0"
      >
        <FaCar />
        <span>Carros</span>
      </button>
      <button
        onClick={() => navigate('/empresas')}
        className="text-white hover:text-red-600 transition-colors flex items-center space-x-2 text-sm md:text-base py-2 md:py-0"
      >
        <FaBuilding />
        <span>Empresas</span>
      </button>
      <button
        onClick={handleNovoUsuario}
        className="btn-primary flex items-center space-x-2 text-sm md:text-base w-full md:w-auto justify-center"
      >
        <FaPlus />
        <span>Novo Usuário</span>
      </button>
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
        title="Gerenciar Usuários"
        icon={FaUsers}
        customButtons={customButtons}
        showBackButton={true}
        backTo="/dashboard"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="btn-secondary flex items-center space-x-2 mb-4"
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
                  className="input-enhanced text-white"
                />
                <input
                  type="text"
                  placeholder="Email"
                  value={filtros.email}
                  onChange={(e) => handleFiltroChange('email', e.target.value)}
                  className="input-enhanced text-white"
                />
                <select
                  value={filtros.role || ''}
                  onChange={(e) => handleFiltroChange('role', e.target.value || null)}
                  className="input-enhanced text-white"
                >
                  <option value="">Todos os Perfis</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="OPERADOR">Operador</option>
                  <option value="VISUALIZADOR">Visualizador</option>
                </select>
                <select
                  value={filtros.ativo === null ? '' : filtros.ativo}
                  onChange={(e) => handleFiltroChange('ativo', e.target.value === '' ? null : e.target.value === 'true')}
                  className="input-enhanced text-white"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativos</option>
                  <option value="false">Inativos</option>
                </select>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) => handleFiltroChange('ordenarPor', e.target.value)}
                  className="input-enhanced text-white"
                >
                  <option value="nome">Nome</option>
                  <option value="email">Email</option>
                </select>
                <select
                  value={filtros.direcao}
                  onChange={(e) => handleFiltroChange('direcao', e.target.value)}
                  className="input-enhanced text-white"
                >
                  <option value="ASC">Crescente</option>
                  <option value="DESC">Decrescente</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={buscarComFiltros}
                  className="btn-primary"
                >
                  Buscar
                </button>
                <button
                  onClick={limparFiltros}
                  className="btn-secondary"
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaUsers className="text-6xl text-red-600" />
            </div>
            <h2 className="empty-state-title">Nenhum usuário cadastrado</h2>
            <p className="empty-state-description">
              Comece cadastrando seu primeiro usuário no sistema
            </p>
            <div className="empty-state-action">
              <button
                onClick={handleNovoUsuario}
                className="btn-primary"
              >
                Cadastrar Primeiro Usuário
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.map((usuario, index) => {
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
              const fotoUrl = usuario.foto 
                ? (usuario.foto.startsWith('http') 
                    ? usuario.foto 
                    : `${apiBaseUrl.replace('/api', '')}${usuario.foto}`)
                : null
              
              return (
              <div key={usuario.id} className="stagger-animation bg-gray-900 rounded-lg p-6 border border-gray-800" style={{ animationDelay: `${index * 0.05}s` }}>
                {/* Header do Card - Foto, Nome, Email, Status e Botão Remover */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={usuario.nome}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                        <FaUser className="text-gray-400 text-xl" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{usuario.nome}</h3>
                      <p className="text-gray-400 text-sm">{usuario.email}</p>
                    </div>
                  </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`status-badge ${usuario.ativo ? 'active' : 'inactive'} whitespace-nowrap`}>
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </span>
               <button
                 onClick={() => handleRemoverUsuario(usuario.id, usuario.nome)}
                 className="btn-icon btn-icon-danger pulse-on-hover"
                 type="button"
                 data-tooltip="Remover usuário permanentemente"
                 aria-label="Remover usuário"
               >
                 <FaTrash className="text-sm" />
               </button>
                  </div>
                </div>

                {/* Informações do Usuário */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium ${getRoleColor(usuario.role)} text-white`}>
                      {usuario.roleDescricao || usuario.role}
                    </span>
                  </div>
                  {usuario.empresaNome && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <FaBuilding className="text-gray-400" />
                      <span className="text-sm">{usuario.empresaNome}</span>
                    </div>
                  )}
                </div>

                {/* Select para alterar Role */}
                <div className="mt-4">
                  <select
                    value={usuario.role}
                    onChange={(e) => handleAlterarRole(usuario.id, e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="OPERADOR">Operador</option>
                    <option value="VISUALIZADOR">Visualizador</option>
                  </select>
                </div>
              </div>
              )
            })}
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
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        role: usuario.role || 'OPERADOR',
        empresaId: usuario.empresaId || null
      })
      // Se o usuário já tem foto, mostrar preview
      if (usuario.foto) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
        const fotoUrl = usuario.foto.startsWith('http') 
          ? usuario.foto 
          : `${apiBaseUrl.replace('/api', '')}${usuario.foto}`
        setFotoPreview(fotoUrl)
      } else {
        setFotoPreview(null)
      }
    } else {
      setFotoPreview(null)
      setFoto(null)
    }
  }, [usuario, empresas])
  
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFoto(file)
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      
      // Adicionar dados do usuário como JSON
      const usuarioData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        role: formData.role,
        empresaId: empresas.length > 0 ? empresas[0].id : null
      }
      
      formDataToSend.append('usuario', new Blob([JSON.stringify(usuarioData)], {
        type: 'application/json'
      }))
      
      // Adicionar foto se fornecida
      if (foto) {
        formDataToSend.append('foto', foto)
      }
      
      if (usuario) {
        // Para edição, usar PUT com multipart
        await api.put(`/usuarios/${usuario.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await api.post('/usuarios', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário: ' + (error.response?.data || error.message))
    }
  }

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50" onClick={onClose}>
      <div className="modal-content bg-gray-900 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
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
          
          {/* Upload de Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Foto do Usuário (opcional)
            </label>
            <div className="flex items-center space-x-4">
              <label className="btn-primary flex items-center space-x-2 cursor-pointer">
                <FaUpload />
                <span>Selecionar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {foto && (
                <span className="text-gray-400 text-sm">Foto selecionada</span>
              )}
            </div>
            {fotoPreview && (
              <div className="mt-4">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-full border-2 border-red-600"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
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

