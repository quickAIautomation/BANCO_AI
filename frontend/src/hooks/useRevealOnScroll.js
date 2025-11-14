import { useEffect, useRef, useState } from 'react'

export const useRevealOnScroll = (options = {}) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const elementRef = useRef(null)
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true
  } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          if (once) {
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsRevealed(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, once])

  return [elementRef, isRevealed]
}

