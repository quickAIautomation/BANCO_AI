import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

export const RevealOnScroll = ({ 
  children, 
  direction = 'up',
  className = '',
  threshold = 0.1,
  once = true
}) => {
  const [ref, isRevealed] = useRevealOnScroll({ threshold, once })
  
  const directionClass = {
    up: 'reveal-on-scroll',
    left: 'reveal-on-scroll-left',
    right: 'reveal-on-scroll-right'
  }[direction] || 'reveal-on-scroll'

  return (
    <div
      ref={ref}
      className={`${directionClass} ${isRevealed ? 'revealed' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

