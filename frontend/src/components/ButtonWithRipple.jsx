import { useRipple } from '../utils/ripple'

export const ButtonWithRipple = ({ 
  children, 
  className = '', 
  onClick,
  ...props 
}) => {
  const { createRipple } = useRipple()
  
  const handleClick = (e) => {
    createRipple(e)
    if (onClick) onClick(e)
  }
  
  return (
    <button
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

