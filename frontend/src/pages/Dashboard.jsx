import { useState, useEffect } from 'react'
import { removeToken, getUserRole } from '../utils/auth'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import CarroCard from '../components/CarroCard'
import CarroForm from '../components/CarroForm'
import { canCreateCarro, canEditCarro, canDeleteCarro, canManageEmpresas } from '../utils/permissions'
import { FaCar, FaSignOutAlt, FaPlus, FaUser, FaBuilding, FaSearch, FaTachometerAlt, FaCalendarAlt, FaFilter } from 'react-icons/fa'

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
    dataInicio: '',
    ordenarPor: 'dataCadastro',
    direcao: 'DESC',
    pagina: 0,
    tamanho: 20
  })
  const [totalPages, setTotalPages] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const role = getUserRole()
    setUserRole(role)
    carregarCarros()
  }, [])

  const carregarCarros = async () => {
    try {
      const response = await api.get('/carros')
      setCarros(response.data)
    } catch (error) {
      console.error('Erro ao carregar carros:', error)
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
        placa: filtros.placa || null,
        modelo: filtros.modelo || null,
        marca: filtros.marca || null,
        quilometragemMin: filtros.quilometragemMin ? parseInt(filtros.quilometragemMin) : null,
        quilometragemMax: filtros.quilometragemMax ? parseInt(filtros.quilometragemMax) : null,
        dataInicio: dataInicio,
        dataFim: dataFim,
        ordenarPor: filtros.ordenarPor,
        direcao: filtros.direcao,
        pagina: filtros.pagina,
        tamanho: filtros.tamanho
      }
      
      const response = await api.post('/carros/buscar', buscaDTO)
      setCarros(response.data.content || [])
      setTotalPages(response.data.totalPages || 0)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar carros:', error)
      setLoading(false)
    }
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
      dataInicio: '',
      ordenarPor: 'dataCadastro',
      direcao: 'DESC',
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

  const handleFormClose = () => {
    setShowForm(false)
    setCarroEditando(null)
    carregarCarros()
  }

  const handleDeletarCarro = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este carro?')) {
      try {
        await api.delete(`/carros/${id}`)
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
      <header className="bg-black border-b-2 border-red-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaCar className="text-red-600 text-3xl" />
              <h1 className="text-3xl font-bold text-white">BANCO AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {canCreateCarro(userRole) && (
                <button
                  onClick={handleNovoCarro}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2 transition-colors"
                >
                  <FaPlus />
                  <span>Novo Carro</span>
                </button>
              )}
              {canManageEmpresas(userRole) && (
                <button
                  onClick={() => navigate('/empresas')}
                  className="text-white hover:text-red-600 transition-colors flex items-center space-x-2"
                >
                  <FaBuilding />
                  <span>Empresas</span>
                </button>
              )}
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
            <FaFilter />
            <span>FILTRO</span>
          </button>

          {showFiltros && (
            <div className="bg-gray-900 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FaCar className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Placa"
                    value={filtros.placa}
                    onChange={(e) => handleFiltroChange('placa', e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Modelo"
                  value={filtros.modelo}
                  onChange={(e) => handleFiltroChange('modelo', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Marca"
                  value={filtros.marca}
                  onChange={(e) => handleFiltroChange('marca', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                />
                <div className="flex items-center space-x-2">
                  <FaTachometerAlt className="text-gray-400" />
                  <input
                    type="number"
                    placeholder="Quilometragem Mínima"
                    value={filtros.quilometragemMin}
                    onChange={(e) => handleFiltroChange('quilometragemMin', e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaTachometerAlt className="text-gray-400" />
                  <input
                    type="number"
                    placeholder="Quilometragem Máxima"
                    value={filtros.quilometragemMax}
                    onChange={(e) => handleFiltroChange('quilometragemMax', e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <input
                    type="date"
                    placeholder="Data de Cadastro"
                    value={filtros.dataInicio}
                    onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md"
                  />
                </div>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) => handleFiltroChange('ordenarPor', e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md"
                >
                  <option value="quilometragem">Quilometragem</option>
                  <option value="modelo">Modelo</option>
                  <option value="marca">Marca</option>
                  <option value="placa">Placa</option>
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
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
                >
                  <FaSearch />
                  <span>Buscar</span>
                </button>
                <button
                  onClick={limparFiltros}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Carregando carros...</div>
        ) : carros.length === 0 ? (
          <div className="text-center text-white">
            <p className="text-xl mb-4">Nenhum carro encontrado.</p>
            <button
              onClick={handleNovoCarro}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Cadastrar Primeiro Carro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carros.map((carro) => (
              <CarroCard
                key={carro.id}
                carro={carro}
                onEdit={handleEditarCarro}
                onDelete={handleDeletarCarro}
                canEdit={canEditCarro(userRole)}
                canDelete={canDeleteCarro(userRole)}
              />
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

