import { FaEdit, FaTrash, FaCar, FaTachometerAlt, FaCalendarAlt } from 'react-icons/fa'

function CarroCard({ carro, onEdit, onDelete, canEdit = true, canDelete = true }) {
  // As fotos já vêm como base64 do backend (formato: data:image/...;base64,...)
  const primeiraFoto = carro.fotos && carro.fotos.length > 0 
    ? carro.fotos[0] 
    : null

  const handleImageError = (e) => {
    e.target.style.display = 'none'
    e.target.nextSibling?.classList.remove('hidden')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Imagem do Carro */}
      <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
        {primeiraFoto ? (
          <>
            <img 
              src={primeiraFoto} 
              alt={`${carro.marca} ${carro.modelo}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center">
              <FaCar className="text-gray-400 text-6xl" />
            </div>
          </>
        ) : (
          <FaCar className="text-gray-400 text-6xl" />
        )}
      </div>

      {/* Informações do Carro */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-black mb-1">
            {carro.marca} {carro.modelo}
          </h3>
          <p className="text-red-600 font-semibold text-lg">Placa: {carro.placa}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-700">
            <FaTachometerAlt className="mr-2 text-red-600" />
            <span>{carro.quilometragem.toLocaleString('pt-BR')} km</span>
          </div>
          
          {carro.dataCadastro && (
            <div className="flex items-center text-gray-700">
              <FaCalendarAlt className="mr-2 text-red-600" />
              <span className="text-sm">Cadastrado em: {carro.dataCadastro}</span>
            </div>
          )}

          {carro.fotos && carro.fotos.length > 0 && (
            <div className="text-sm text-gray-600">
              {carro.fotos.length} foto{carro.fotos.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {carro.observacoes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{carro.observacoes}</p>
          </div>
        )}

        {/* Ações */}
        {(canEdit || canDelete) && (
          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            {canEdit && (
              <button
                onClick={() => onEdit(carro)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors"
              >
                <FaEdit />
                <span>Editar</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(carro.id)}
                className="flex-1 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center justify-center space-x-2 transition-colors"
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

