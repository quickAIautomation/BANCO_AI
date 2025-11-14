// Hook para adicionar ripple effect aos botões
export const useRipple = () => {
  const createRipple = (event) => {
    const button = event.currentTarget
    
    // Verificar se já tem ripple
    const existingRipple = button.querySelector('.ripple')
    if (existingRipple) {
      existingRipple.remove()
    }
    
    const circle = document.createElement('span')
    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2
    
    const rect = button.getBoundingClientRect()
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${event.clientX - rect.left - radius}px`
    circle.style.top = `${event.clientY - rect.top - radius}px`
    circle.classList.add('ripple')
    
    button.appendChild(circle)
    
    // Remover após animação
    setTimeout(() => {
      circle.remove()
    }, 600)
  }
  
  return { createRipple }
}

