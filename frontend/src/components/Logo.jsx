import logoImage from '../assets/images/logo.png'

function Logo({ className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12 md:w-16 md:h-16',
    large: 'w-20 h-20 md:w-24 md:h-24',
    xl: 'w-32 h-32 md:w-40 md:h-40'
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

