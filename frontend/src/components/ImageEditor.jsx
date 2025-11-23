import { useState, useRef } from 'react'
import { FaCheck, FaTimes, FaUndo, FaRedo, FaExpand, FaCompress } from 'react-icons/fa'

function ImageEditor({ image, onSave, onCancel, aspectRatio = 1 }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialDistance, setInitialDistance] = useState(null)
  const [initialZoom, setInitialZoom] = useState(1)
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value)
    setZoom(newZoom)
  }

  const handleRotationChange = (e) => {
    const newRotation = parseInt(e.target.value)
    setRotation(newRotation)
    // Resetar posição quando rotação mudar
    setPosition({ x: 0, y: 0 })
  }

  const rotateLeft = () => {
    setRotation((prev) => {
      const newRotation = prev - 90
      return newRotation < 0 ? newRotation + 360 : newRotation
    })
    setPosition({ x: 0, y: 0 })
  }

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360)
    setPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1))
  }

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault()
      const distance = getDistance(e.touches[0], e.touches[1])
      setInitialDistance(distance)
      setInitialZoom(zoom)
      setIsDragging(false)
    } else if (zoom > 1 && e.touches.length === 1) {
      // Drag
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
      setInitialDistance(null)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      // Pinch to zoom
      e.preventDefault()
      const distance = getDistance(e.touches[0], e.touches[1])
      const scale = distance / initialDistance
      const newZoom = Math.max(1, Math.min(3, initialZoom * scale))
      setZoom(newZoom)
    } else if (isDragging && zoom > 1 && e.touches.length === 1) {
      // Drag
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setInitialDistance(null)
  }

  const handleSave = async () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = image
      })

      // Tamanho do canvas (quadrado para foto de perfil)
      const size = Math.min(img.width, img.height)
      canvas.width = size
      canvas.height = size

      // Calcular o tamanho da imagem após zoom
      const scaledWidth = img.width * zoom
      const scaledHeight = img.height * zoom

      // Obter o tamanho real do container (responsivo)
      const containerWidth = containerRef.current?.offsetWidth || 400
      const containerHeight = containerRef.current?.offsetHeight || 400

      // Calcular offset baseado na posição e tamanho real do container
      const offsetX = (position.x / containerWidth) * scaledWidth
      const offsetY = (position.y / containerHeight) * scaledHeight

      // Centro do canvas
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // Desenhar imagem com zoom e posição
      ctx.drawImage(
        img,
        -scaledWidth / 2 - offsetX,
        -scaledHeight / 2 - offsetY,
        scaledWidth,
        scaledHeight
      )
      ctx.restore()

      // Converter para blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile-photo.png', { type: 'image/png' })
          onSave(file)
        } else {
          alert('Erro ao processar a imagem. Tente novamente.')
        }
      }, 'image/png', 0.95)
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      alert('Erro ao processar a imagem. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-[10000] flex flex-col">
      {/* Header estilo Instagram - Responsivo */}
      <div className="bg-black border-b border-gray-800 px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between min-h-[44px]">
        <button
          onClick={onCancel}
          className="text-white text-sm md:text-base font-semibold hover:text-gray-400 transition-colors min-h-[44px] px-2 md:px-3"
          aria-label="Cancelar edição"
        >
          Cancelar
        </button>
        <h3 className="text-white font-semibold text-sm md:text-base">Editar Foto</h3>
        <button
          onClick={handleSave}
          className="text-blue-500 text-sm md:text-base font-semibold hover:text-blue-400 transition-colors min-h-[44px] px-2 md:px-3"
          aria-label="Salvar foto"
        >
          Pronto
        </button>
      </div>

      {/* Área de Preview - Responsivo */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-black overflow-hidden relative px-2 md:px-4 py-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div 
          className="relative w-full max-w-full md:max-w-[400px]"
          style={{
            aspectRatio: aspectRatio,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          }}
        >
          <img
            ref={imageRef}
            src={image}
            alt="Preview"
            className="w-full h-full object-cover select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / (zoom || 1)}px, ${position.y / (zoom || 1)}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              willChange: 'transform'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Controles Inferiores estilo Instagram - Responsivo */}
      <div className="bg-black border-t border-gray-800 px-3 md:px-4 py-3 md:py-4">
        {/* Rotação */}
        <div className="mb-3 md:mb-4">
          <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-2 md:mb-3">
            <button
              onClick={rotateLeft}
              className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center text-white transition-colors min-w-[48px] min-h-[48px] md:min-w-[40px] md:min-h-[40px]"
              aria-label="Rotacionar esquerda"
            >
              <FaUndo className="text-base md:text-lg" />
            </button>
            <div className="flex-1 min-w-0">
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={handleRotationChange}
                className="w-full h-2 md:h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Rotação"
              />
              <div className="text-center text-gray-400 text-xs md:text-xs mt-1">
                {rotation}°
              </div>
            </div>
            <button
              onClick={rotateRight}
              className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center text-white transition-colors min-w-[48px] min-h-[48px] md:min-w-[40px] md:min-h-[40px]"
              aria-label="Rotacionar direita"
            >
              <FaRedo className="text-base md:text-lg" />
            </button>
          </div>
        </div>

        {/* Zoom */}
        <div>
          <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-2 md:mb-3">
            <button
              onClick={zoomOut}
              disabled={zoom <= 1}
              className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors min-w-[48px] min-h-[48px] md:min-w-[40px] md:min-h-[40px]"
              aria-label="Diminuir zoom"
            >
              <FaCompress className="text-base md:text-lg" />
            </button>
            <div className="flex-1 min-w-0">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={handleZoomChange}
                className="w-full h-2 md:h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Zoom"
              />
              <div className="text-center text-gray-400 text-xs md:text-xs mt-1">
                {zoom.toFixed(1)}x
              </div>
            </div>
            <button
              onClick={zoomIn}
              disabled={zoom >= 3}
              className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors min-w-[48px] min-h-[48px] md:min-w-[40px] md:min-h-[40px]"
              aria-label="Aumentar zoom"
            >
              <FaExpand className="text-base md:text-lg" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        .slider::-moz-range-thumb:active {
          transform: scale(1.2);
        }
        @media (min-width: 768px) {
          .slider::-webkit-slider-thumb {
            width: 18px;
            height: 18px;
          }
          .slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  )
}

export default ImageEditor

