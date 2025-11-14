import { useState, useEffect } from 'react'
import api from '../services/api'
import { getUserRole, getSelectedEmpresaId } from '../utils/auth'
import { getApiBaseUrl } from '../services/api'
import { FaTimes, FaUpload, FaCar, FaTachometerAlt, FaTag, FaDollarSign, FaFileAlt, FaImage, FaTrash } from 'react-icons/fa'

function CarroForm({ carro, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    placa: '',
    quilometragem: '',
    modelo: '',
    marca: '',
    valor: '',
    observacoes: ''
  })
  const [fotos, setFotos] = useState([])
  const [fotosPreview, setFotosPreview] = useState([])
  const [fotosExistentes, setFotosExistentes] = useState([]) // URLs das fotos existentes do backend
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (carro) {
      setFormData({
        placa: carro.placa || '',
        quilometragem: carro.quilometragem || '',
        modelo: carro.modelo || '',
        marca: carro.marca || '',
        valor: carro.valor || '',
        observacoes: carro.observacoes || ''
      })
      // Carregar fotos existentes (vêm como URLs do backend)
      if (carro.fotos && carro.fotos.length > 0) {
        const fotosComUrlsCompletas = carro.fotos.map(foto => 
          foto.startsWith('http') ? foto : `${getApiBaseUrl()}${foto}`
        )
        setFotosExistentes(fotosComUrlsCompletas)
        setFotosPreview(fotosComUrlsCompletas)
      } else {
        setFotosExistentes([])
        setFotosPreview([])
      }
      setFotos([]) // Limpar novas fotos ao editar
    } else {
      // Limpar previews ao criar novo carro
      setFotosPreview([])
      setFotos([])
      setFotosExistentes([])
    }
  }, [carro])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFotos(prev => [...prev, ...files])
    
    // Criar previews das novas fotos e adicionar às existentes
    const novosPreviews = files.map(file => URL.createObjectURL(file))
    setFotosPreview(prev => [...prev, ...novosPreviews])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Adicionar dados do carro como JSON
      const carroData = {
        placa: formData.placa,
        quilometragem: parseInt(formData.quilometragem),
        modelo: formData.modelo,
        marca: formData.marca,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        observacoes: formData.observacoes
      }
      
      formDataToSend.append('carro', new Blob([JSON.stringify(carroData)], {
        type: 'application/json'
      }))

      // Adicionar fotos
      fotos.forEach(foto => {
        formDataToSend.append('fotos', foto)
      })

      // Se for admin, adicionar empresaId como parâmetro
      const params = {}
      const userRole = getUserRole()
      if (userRole === 'ADMIN') {
        const empresaId = getSelectedEmpresaId()
        if (empresaId) {
          params.empresaId = empresaId
        }
      }

      let response
      if (carro) {
        // Atualizar
        response = await api.put(`/carros/${carro.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params
        })
      } else {
        // Criar
        response = await api.post('/carros', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params
        })
      }

      // Só chamar onSuccess e onClose se a resposta foi bem-sucedida
      if (response && (response.status === 200 || response.status === 201)) {
        onSuccess()
        // Passar true apenas se foi criado (não editado) para mostrar notificação
        onClose(!carro) // true se criou, false se editou
      }
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar carro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePhoto = (index) => {
    // Se está editando e a foto é uma existente (antes do índice das novas fotos)
    if (carro && index < fotosExistentes.length) {
      // Remover da lista de existentes
      const novasExistentes = fotosExistentes.filter((_, i) => i !== index)
      setFotosExistentes(novasExistentes)
      // Atualizar preview removendo a existente
      const novasPreviews = fotosPreview.filter((_, i) => i !== index)
      setFotosPreview(novasPreviews)
    } else {
      // É uma foto nova, remover normalmente
      const fotoIndex = carro ? index - fotosExistentes.length : index
      const newFotos = fotos.filter((_, i) => i !== fotoIndex)
      const newPreviews = fotosPreview.filter((_, i) => i !== index)
      setFotos(newFotos)
      setFotosPreview(newPreviews)
    }
  }

  // Esconder header quando modal está aberto
  useEffect(() => {
    const header = document.querySelector('header')
    if (header) {
      header.style.display = 'none'
    }
    return () => {
      if (header) {
        header.style.display = ''
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[10000] p-6" onClick={() => onClose(false)}>
      <div className="modal-content rounded-lg max-w-3xl w-full h-[90vh] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <FaCar className="text-red-600 text-2xl" />
            <h2 className="text-2xl font-bold text-white">
              {carro ? 'Editar Carro' : 'Novo Carro'}
            </h2>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-900 min-h-0">
          <div className="p-6 space-y-6">
            {erro && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
                <FaTimes />
                <span>{erro}</span>
              </div>
            )}

            {/* Informações Básicas */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaCar className="text-red-600" />
                <span>Informações Básicas</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="placa" className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <FaTag className="text-red-600 text-xs" />
                    <span>Placa *</span>
                  </label>
                  <input
                    type="text"
                    id="placa"
                    name="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="input-enhanced w-full text-white"
                    placeholder="ABC-1234"
                  />
                </div>

                <div>
                  <label htmlFor="quilometragem" className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <FaTachometerAlt className="text-red-600 text-xs" />
                    <span>Quilometragem *</span>
                  </label>
                  <input
                    type="number"
                    id="quilometragem"
                    name="quilometragem"
                    value={formData.quilometragem}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input-enhanced w-full text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="marca" className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <FaCar className="text-red-600 text-xs" />
                    <span>Marca *</span>
                  </label>
                  <input
                    type="text"
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    className="input-enhanced w-full text-white"
                    placeholder="Ex: Toyota"
                  />
                </div>

                <div>
                  <label htmlFor="modelo" className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                    <FaTag className="text-red-600 text-xs" />
                    <span>Modelo *</span>
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                    className="input-enhanced w-full text-white"
                    placeholder="Ex: Corolla"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="valor" className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <FaDollarSign className="text-red-600 text-xs" />
                  <span>Valor (R$)</span>
                </label>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-enhanced w-full text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Observações */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaFileAlt className="text-red-600" />
                <span>Observações</span>
              </h3>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="4"
                className="input-enhanced w-full text-white resize-none"
                placeholder="Observações sobre o veículo..."
              />
            </div>

            {/* Fotos */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaImage className="text-red-600" />
                <span>Fotos do Veículo</span>
              </h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="btn-primary flex items-center space-x-2 cursor-pointer pulse-on-hover">
                  <FaUpload />
                  <span>Selecionar Fotos</span>
                  <input
                    type="file"
                    id="fotos"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {fotos.length > 0 && (
                  <span className="text-gray-400 text-sm">
                    {fotos.length} foto{fotos.length > 1 ? 's' : ''} selecionada{fotos.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {fotosPreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {fotosPreview.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-700 group-hover:border-red-600 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        aria-label="Remover foto"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-6 py-4 flex space-x-4 flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{carro ? 'Atualizar' : 'Cadastrar'}</span>
              )}
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

export default CarroForm

