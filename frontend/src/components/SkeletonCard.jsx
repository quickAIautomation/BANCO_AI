function SkeletonCard() {
  return (
    <div className="card-elevated overflow-hidden animate-pulse">
      {/* Imagem Skeleton */}
      <div className="h-48 bg-gray-700"></div>
      
      {/* Conteúdo Skeleton */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        
        {/* Informações */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6"></div>
        </div>
        
        {/* Botões */}
        <div className="flex space-x-2 pt-4 border-t border-gray-700">
          <div className="h-10 bg-gray-700 rounded flex-1"></div>
          <div className="h-10 bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard

