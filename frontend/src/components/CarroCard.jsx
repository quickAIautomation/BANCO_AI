import { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaCar, FaTachometerAlt, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { getApiBaseUrl } from '../services/api'

function CarroCard({ carro, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const [fotoAtual, setFotoAtual] = useState(0)
  
  const fotos = carro.fotos && carro.fotos.length > 0 
    ? carro.fotos.map(foto => `${getApiBaseUrl()}${foto}`)
    : []
  
  const fotoExibida = fotos.length > 0 ? fotos[fotoAtual] : null
  const temMultiplasFotos = fotos.length > 1

  // Resetar índice da foto quando o carro mudar
  useEffect(() => {
    setFotoAtual(0)
  }, [carro.id])

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    e.target.nextSibling?.classList.remove('hidden')
  }

  const proximaFoto = (e) => {
    e.stopPropagation()
    setFotoAtual((prev) => (prev + 1) % fotos.length)
  }

  const fotoAnterior = (e) => {
    e.stopPropagation()
    setFotoAtual((prev) => (prev - 1 + fotos.length) % fotos.length)
  }

  return (
    <div className="card-elevated overflow-hidden fade-in">
      {/* Imagem do Carro com Navegação de Fotos */}
      <div className="h-48 bg-gray-800 flex items-center justify-center overflow-hidden relative group">
        {fotoExibida ? (
          <>
            <img 
              src={fotoExibida} 
              alt={`${carro.marca} ${carro.modelo} - Foto ${fotoAtual + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={handleImageError}
            />
            
            {/* Controles de navegação de fotos */}
            {temMultiplasFotos && (
              <>
                {/* Botão anterior */}
                <button
                  onClick={fotoAnterior}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                  aria-label="Foto anterior"
                >
                  <FaChevronLeft />
                </button>
                
                {/* Botão próximo */}
                <button
                  onClick={proximaFoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
                  aria-label="Próxima foto"
                >
                  <FaChevronRight />
                </button>
                
                {/* Indicador de fotos */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full flex items-center space-x-1 z-10">
                  {fotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setFotoAtual(index)
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === fotoAtual ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Ir para foto ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Contador de fotos */}
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs z-10">
                  {fotoAtual + 1} / {fotos.length}
                </div>
              </>
            )}
            
            <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-800">
              <FaCar className="text-gray-600 text-6xl" />
            </div>
          </>
        ) : (
          <FaCar className="text-gray-600 text-6xl" />
        )}
      </div>

      {/* Informações do Carro */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {carro.marca} {carro.modelo}
          </h3>
          <p className="text-red-500 font-semibold text-base">Placa: {carro.placa}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <FaTachometerAlt className="mr-3 text-red-500" />
            <span className="text-sm">{carro.quilometragem.toLocaleString('pt-BR')} km</span>
          </div>
          
          {carro.valor && (
            <div className="flex items-center text-gray-300">
              <span className="mr-3 text-red-500 font-semibold">R$</span>
              <span className="text-sm font-semibold">{carro.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          
          {carro.dataCadastro && (
            <div className="flex items-center text-gray-400">
              <FaCalendarAlt className="mr-3 text-red-500" />
              <span className="text-xs">Cadastrado em: {carro.dataCadastro}</span>
            </div>
          )}

          {carro.fotos && carro.fotos.length > 0 && (
            <div className="text-xs text-gray-500">
              {carro.fotos.length} foto{carro.fotos.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {carro.observacoes && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 line-clamp-2">{carro.observacoes}</p>
          </div>
        )}

        {/* Ações */}
        {(canEdit || canDelete) && (
          <div className="flex space-x-2 pt-4 border-t border-gray-700">
            {canEdit && (
              <button
                onClick={() => onEdit(carro)}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 pulse-on-hover"
                data-tooltip="Editar informações do carro"
              >
                <FaEdit />
                <span>Editar</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(carro.id)}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2 pulse-on-hover"
                data-tooltip="Remover carro do sistema"
              >
                <FaTrash />
                <span>Deletar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CarroCard

