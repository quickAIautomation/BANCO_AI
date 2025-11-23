import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { FaCheck, FaTimes, FaRedo, FaSearch } from 'react-icons/fa'

function ImageCropper({ image, onCropComplete, onCancel, aspectRatio = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = useCallback((crop) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom)
  }, [])

  const onRotationChange = useCallback((rotation) => {
    setRotation(rotation)
  }, [])

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    try {
      let pixelsToUse = croppedAreaPixels
      
      if (!pixelsToUse) {
        // Se não houver área cortada ainda, usar a imagem inteira
        const img = await createImage(image)
        pixelsToUse = {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height
        }
      }

      const croppedImage = await getCroppedImg(image, pixelsToUse, rotation)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error('Erro ao processar imagem:', e)
      alert('Erro ao processar a imagem. Tente novamente.')
    }
  }, [image, croppedAreaPixels, rotation, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Editar Foto</h3>
          <button
            onClick={onCancel}
            className="text-white hover:text-red-600 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 min-h-[400px] bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative'
              }
            }}
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 space-y-4">
          {/* Zoom */}
          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center space-x-2">
              <FaSearch />
              <span>Zoom</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-white text-xs text-center mt-1">{zoom.toFixed(1)}x</div>
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-white text-sm font-medium mb-2 flex items-center space-x-2">
              <FaRedo />
              <span>Rotacionar</span>
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-white text-xs text-center mt-1">{rotation}°</div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaTimes />
              <span>Cancelar</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaCheck />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para criar a imagem cortada
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Não foi possível criar contexto do canvas')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Erro ao criar blob da imagem')
      }
      const file = new File([blob], 'cropped-image.png', { type: 'image/png' })
      resolve(file)
    }, 'image/png')
  })
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

export default ImageCropper

