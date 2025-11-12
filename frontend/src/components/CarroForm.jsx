import { useState, useEffect } from 'react'
import api from '../services/api'
import { getUserRole, getSelectedEmpresaId } from '../utils/auth'
import { FaTimes, FaUpload } from 'react-icons/fa'

function CarroForm({ carro, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    placa: '',
    quilometragem: '',
    modelo: '',
    marca: '',
    observacoes: ''
  })
  const [fotos, setFotos] = useState([])
  const [fotosPreview, setFotosPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (carro) {
      setFormData({
        placa: carro.placa || '',
        quilometragem: carro.quilometragem || '',
        modelo: carro.modelo || '',
        marca: carro.marca || '',
        observacoes: carro.observacoes || ''
      })
      // Carregar fotos existentes (já vêm em base64 do backend)
      if (carro.fotos && carro.fotos.length > 0) {
        setFotosPreview(carro.fotos)
      }
    } else {
      // Limpar previews ao criar novo carro
      setFotosPreview([])
      setFotos([])
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
    setFotos(files)
    
    // Criar previews
    const previews = files.map(file => URL.createObjectURL(file))
    setFotosPreview(previews)
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

      if (carro) {
        // Atualizar
        await api.put(`/carros/${carro.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params
        })
      } else {
        // Criar
        await api.post('/carros', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          params
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar carro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">
            {carro ? 'Editar Carro' : 'Novo Carro'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {erro}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="placa" className="block text-sm font-medium text-black mb-2">
                Placa *
              </label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleChange}
                required
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                placeholder="ABC-1234"
              />
            </div>

            <div>
              <label htmlFor="quilometragem" className="block text-sm font-medium text-black mb-2">
                Quilometragem *
              </label>
              <input
                type="number"
                id="quilometragem"
                name="quilometragem"
                value={formData.quilometragem}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="marca" className="block text-sm font-medium text-black mb-2">
                Marca *
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                placeholder="Ex: Toyota"
              />
            </div>

            <div>
              <label htmlFor="modelo" className="block text-sm font-medium text-black mb-2">
                Modelo *
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
                placeholder="Ex: Corolla"
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-black mb-2">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 text-black"
              placeholder="Observações sobre o veículo..."
            />
          </div>

          <div>
            <label htmlFor="fotos" className="block text-sm font-medium text-black mb-2">
              Fotos do Veículo
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer transition-colors">
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
                <span className="text-gray-600">{fotos.length} foto(s) selecionada(s)</span>
              )}
            </div>

            {fotosPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {fotosPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : carro ? 'Atualizar' : 'Cadastrar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 font-medium transition-colors"
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

