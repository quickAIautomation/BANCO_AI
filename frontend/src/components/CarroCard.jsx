import { FaEdit, FaTrash, FaCar, FaTachometerAlt, FaCalendarAlt } from 'react-icons/fa'
import { getApiBaseUrl } from '../services/api'

function CarroCard({ carro, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const primeiraFoto = carro.fotos && carro.fotos.length > 0 
    ? `${getApiBaseUrl()}${carro.fotos[0]}` 
    : null

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    e.target.nextSibling?.classList.remove('hidden')
  }

  return (
    <div className="card-elevated overflow-hidden fade-in">
      {/* Imagem do Carro com Preview em Hover */}
      <div className="h-48 bg-gray-800 flex items-center justify-center overflow-hidden relative group">
        {primeiraFoto ? (
          <>
            <img 
              src={primeiraFoto} 
              alt={`${carro.marca} ${carro.modelo}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={handleImageError}
            />
            {/* Overlay com preview de outras fotos */}
            {carro.fotos && carro.fotos.length > 1 && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center">
                  <FaCar className="text-white text-4xl mb-2 mx-auto" />
                  <p className="text-white text-sm font-semibold">
                    {carro.fotos.length} foto{carro.fotos.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-white/80 text-xs mt-1">Clique para ver todas</p>
                </div>
              </div>
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

