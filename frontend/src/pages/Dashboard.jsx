import { useState, useEffect } from 'react'
import { removeToken, getUserRole, getSelectedEmpresaId, setSelectedEmpresaId, getUserEmpresaId } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import CarroCard from '../components/CarroCard'
import CarroForm from '../components/CarroForm'
import Header from '../components/Header'
import { canCreateCarro, canEditCarro, canDeleteCarro, canManageEmpresas } from '../utils/permissions'
import { useNotification } from '../contexts/NotificationContext'
import { FaCar, FaSearch, FaTachometerAlt, FaCalendarAlt, FaFilter } from 'react-icons/fa'

function Dashboard({ setIsAuthenticated }) {
  const [carros, setCarros] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [carroEditando, setCarroEditando] = useState(null)
  const [showFiltros, setShowFiltros] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [filtros, setFiltros] = useState({
    placa: '',
    modelo: '',
    marca: '',
    quilometragemMin: '',
    quilometragemMax: '',
    valorMin: '',
    valorMax: '',
    dataInicio: '',
    ordenarPor: 'dataCadastro',
    direcao: 'DESC', // Sempre decrescente
    pagina: 0,
    tamanho: 20
  })
  const [totalPages, setTotalPages] = useState(0)
  const [empresas, setEmpresas] = useState([])
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)
  const [inicializado, setInicializado] = useState(false)
  const navigate = useNavigate()
  const { success } = useNotification()

  useEffect(() => {
    const inicializar = async () => {
      const role = getUserRole()
      setUserRole(role)
      
      // Inicializar empresa selecionada
      const empresaId = getSelectedEmpresaId() || getUserEmpresaId()
      if (empresaId) {
        setEmpresaSelecionada(empresaId)
      }
      
      // Se for admin, carregar lista de empresas primeiro
      if (role === 'ADMIN') {
        await carregarEmpresas()
      }
      
      // Carregar carros
      carregarCarros()
      setInicializado(true)
    }
    
    inicializar()
  }, [])

  useEffect(() => {
    // Recarregar carros quando trocar de empresa (apenas se já tiver inicializado)
    if (inicializado && empresaSelecionada && userRole) {
      carregarCarros()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaSelecionada])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas')
      setEmpresas(response.data)
      
      // Se não tiver empresa selecionada, usar a primeira ou a do usuário
      if (response.data.length > 0) {
        const empresaIdSalva = getSelectedEmpresaId()
        const empresaIdUsuario = getUserEmpresaId()
        const empresaId = empresaIdSalva || empresaIdUsuario || response.data[0].id
        
        setEmpresaSelecionada(empresaId)
        setSelectedEmpresaId(empresaId)
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      if (error.response?.status === 401) {
        setIsAuthenticated(false)
        removeToken()
        navigate('/login')
      }
    }
  }

  const carregarCarros = async () => {
    try {
      setLoading(true)
      const params = {}
      // Se for admin e tiver empresa selecionada, passar como parâmetro
      if (userRole === 'ADMIN' && empresaSelecionada) {
        params.empresaId = empresaSelecionada
      }
      
      const response = await api.get('/carros', { params })
      setCarros(response.data)
    } catch (error) {
      console.error('Erro ao carregar carros:', error)
      if (error.response?.status === 401) {
        setIsAuthenticated(false)
        removeToken()
        navigate('/login')
        return
      }
      // Se não for 401, limpar carros para evitar mostrar dados antigos
      setCarros([])
    } finally {
      setLoading(false)
    }
  }

  const buscarComFiltros = async () => {
    try {
      setLoading(true)
      
      // Converter data para o formato ISO-8601 que o Spring Boot espera
      let dataInicio = null
      let dataFim = null
      
      if (filtros.dataInicio) {
        // Usar a mesma data para início e fim (buscar carros cadastrados nessa data)
        dataInicio = filtros.dataInicio + 'T00:00:00'
        dataFim = filtros.dataInicio + 'T23:59:59'
      }
      
      const buscaDTO = {
        placa: filtros.placa && filtros.placa.trim() !== '' ? filtros.placa.trim() : null,
        modelo: filtros.modelo && filtros.modelo.trim() !== '' ? filtros.modelo.trim() : null,
        marca: filtros.marca && filtros.marca.trim() !== '' ? filtros.marca.trim() : null,
        quilometragemMin: filtros.quilometragemMin && filtros.quilometragemMin !== '' ? parseInt(filtros.quilometragemMin) : null,
        quilometragemMax: filtros.quilometragemMax && filtros.quilometragemMax !== '' ? parseInt(filtros.quilometragemMax) : null,
        valorMin: filtros.valorMin && filtros.valorMin !== '' ? parseFloat(filtros.valorMin) : null,
        valorMax: filtros.valorMax && filtros.valorMax !== '' ? parseFloat(filtros.valorMax) : null,
        dataInicio: dataInicio,
        dataFim: dataFim,
        ordenarPor: filtros.ordenarPor || 'dataCadastro',
        direcao: 'DESC', // Sempre decrescente
        pagina: filtros.pagina || 0,
        tamanho: filtros.tamanho || 20
      }
      
      // Se for admin e tiver empresa selecionada, passar como parâmetro
      const params = {}
      if (userRole === 'ADMIN' && empresaSelecionada) {
        params.empresaId = empresaSelecionada
      }
      
      console.log('Enviando busca:', buscaDTO, params)
      
      const response = await api.post('/carros/buscar', buscaDTO, { params })
      setCarros(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar carros:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar carros. Tente novamente.'
      alert(typeof errorMessage === 'string' ? errorMessage : 'Erro ao buscar carros. Tente novamente.')
      setLoading(false)
    }
  }

  const handleEmpresaChange = (empresaId) => {
    const id = empresaId ? parseInt(empresaId) : null
    setEmpresaSelecionada(id)
    setSelectedEmpresaId(id)
    // Os carros serão recarregados automaticamente pelo useEffect
  }

  const handleFiltroChange = (field, value) => {
    setFiltros({ ...filtros, [field]: value, pagina: 0 })
  }

  const limparFiltros = () => {
    setFiltros({
      placa: '',
      modelo: '',
      marca: '',
      quilometragemMin: '',
      quilometragemMax: '',
      valorMin: '',
      valorMax: '',
      dataInicio: '',
      ordenarPor: 'dataCadastro',
      direcao: 'DESC', // Sempre decrescente
      pagina: 0,
      tamanho: 20
    })
    carregarCarros()
  }

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
    navigate('/login')
  }

  const handleNovoCarro = () => {
    setCarroEditando(null)
    setShowForm(true)
  }

  const handleEditarCarro = (carro) => {
    setCarroEditando(carro)
    setShowForm(true)
  }

  const handleFormClose = (carroCriado = false) => {
    setShowForm(false)
    // Só mostrar notificação se realmente foi criado um novo carro
    if (carroCriado === true) {
      success('Carro cadastrado', 'O carro foi cadastrado com sucesso!')
    }
    setCarroEditando(null)
    carregarCarros()
  }

  const handleDeletarCarro = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este carro?')) {
      try {
        const params = {}
        // Se for admin e tiver empresa selecionada, passar como parâmetro
        if (userRole === 'ADMIN' && empresaSelecionada) {
          params.empresaId = empresaSelecionada
        }
        await api.delete(`/carros/${id}`, { params })
        carregarCarros()
      } catch (error) {
        console.error('Erro ao deletar carro:', error)
        alert('Erro ao deletar carro')
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header
        title="BANCO AI"
        icon={FaCar}
        userRole={userRole}
        empresas={empresas}
        empresaSelecionada={empresaSelecionada}
        onEmpresaChange={handleEmpresaChange}
        canCreateCarro={canCreateCarro(userRole)}
        canManageEmpresas={canManageEmpresas(userRole)}
        onNovoCarro={handleNovoCarro}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8 section-spacing">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className="btn-secondary flex items-center justify-center p-3 mb-4 pulse-on-hover"
            data-tooltip="Filtros de busca"
            aria-label="Mostrar/Ocultar filtros"
          >
            <FaFilter className="text-xl" />
          </button>

          {showFiltros && (
            <div className="glass-container p-4 mb-4 slide-up" style={{ zIndex: 40 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Placa"
                    value={filtros.placa}
                    onChange={(e) => handleFiltroChange('placa', e.target.value)}
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Modelo"
                  value={filtros.modelo}
                  onChange={(e) => handleFiltroChange('modelo', e.target.value)}
                  className="input-enhanced text-white"
                />
                <input
                  type="text"
                  placeholder="Marca"
                  value={filtros.marca}
                  onChange={(e) => handleFiltroChange('marca', e.target.value)}
                  className="input-enhanced text-white"
                />
                <div className="flex items-center space-x-2">
                  <FaTachometerAlt className="text-gray-400" />
                  <input
                    type="number"
                    placeholder="Quilometragem Mínima"
                    value={filtros.quilometragemMin}
                    onChange={(e) => handleFiltroChange('quilometragemMin', e.target.value)}
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaTachometerAlt className="text-gray-400" />
                  <input
                    type="number"
                    placeholder="Quilometragem Máxima"
                    value={filtros.quilometragemMax}
                    onChange={(e) => handleFiltroChange('quilometragemMax', e.target.value)}
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">R$</span>
                  <input
                    type="number"
                    placeholder="Valor Mínimo"
                    value={filtros.valorMin}
                    onChange={(e) => handleFiltroChange('valorMin', e.target.value)}
                    min="0"
                    step="0.01"
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">R$</span>
                  <input
                    type="number"
                    placeholder="Valor Máximo"
                    value={filtros.valorMax}
                    onChange={(e) => handleFiltroChange('valorMax', e.target.value)}
                    min="0"
                    step="0.01"
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <input
                    type="date"
                    placeholder="Data de Cadastro"
                    value={filtros.dataInicio}
                    onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                    className="input-enhanced flex-1 text-white"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={buscarComFiltros}
                  className="btn-primary flex items-center space-x-2 text-sm px-4 py-2"
                >
                  <FaSearch />
                  <span>Buscar</span>
                </button>
                <button
                  onClick={limparFiltros}
                  className="btn-secondary text-sm px-4 py-2"
                >
                  Limpar
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid-enhanced grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-line h-48 mb-4"></div>
                <div className="skeleton-line mb-2"></div>
                <div className="skeleton-line short mb-4"></div>
                <div className="skeleton-line medium mb-2"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
          </div>
               ) : carros.length === 0 ? (
                 <div className="empty-state">
                   <div className="empty-state-icon">
                     <FaCar className="text-6xl text-red-600" />
                   </div>
                   <h2 className="empty-state-title text-white">Nenhum carro encontrado</h2>
                   <p className="empty-state-description text-gray-400">
                     Comece cadastrando seu primeiro veículo no sistema
                   </p>
                   <div className="empty-state-action">
                     <button
                       onClick={handleNovoCarro}
                       className="btn-primary"
                     >
                       Cadastrar Primeiro Carro
                     </button>
                   </div>
                 </div>
        ) : (
          <div className="grid-enhanced grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {carros.map((carro, index) => (
              <div key={carro.id} className="stagger-animation" style={{ animationDelay: `${index * 0.05}s` }}>
                <CarroCard
                  carro={carro}
                  onEdit={handleEditarCarro}
                  onDelete={handleDeletarCarro}
                  canEdit={canEditCarro(userRole)}
                  canDelete={canDeleteCarro(userRole)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Form */}
      {showForm && (
        <CarroForm
          carro={carroEditando}
          onClose={handleFormClose}
          onSuccess={carregarCarros}
        />
      )}
    </div>
  )
}

export default Dashboard

