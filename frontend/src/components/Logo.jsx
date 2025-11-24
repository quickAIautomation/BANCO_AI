import logoImage from '../assets/images/logo.png'

function Logo({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16',
    large: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
    xl: 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40'
  }

  return (
    <img 
      src={logoImage} 
      alt="BANCO AI Logo" 
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  )
}

export default Logo

