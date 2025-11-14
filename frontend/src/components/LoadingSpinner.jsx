import { FaCar } from 'react-icons/fa'

export const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 border-4 border-red-600/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaCar className="text-red-600 text-xs animate-pulse" />
        </div>
      </div>
      {text && (
        <p className="text-gray-400 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}

export const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  )
}

export const LoadingBar = ({ progress = null }) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full transition-all duration-300"
        style={{ 
          width: progress !== null ? `${progress}%` : '100%',
          animation: progress === null ? 'loadingBar 1.5s ease-in-out infinite' : 'none'
        }}
      ></div>
    </div>
  )
}

// Adicionar animação CSS para loading bar
const style = document.createElement('style')
style.textContent = `
  @keyframes loadingBar {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(0%); }
    100% { transform: translateX(100%); }
  }
`
document.head.appendChild(style)

