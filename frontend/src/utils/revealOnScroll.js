// Utilitário para inicializar reveal on scroll automaticamente
export const initRevealOnScroll = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        // Se for "once", remover o observer após revelar
        if (entry.target.dataset.revealOnce !== 'false') {
          observer.unobserve(entry.target)
        }
      } else if (entry.target.dataset.revealOnce === 'false') {
        // Se não for "once", remover a classe quando sair da viewport
        entry.target.classList.remove('revealed')
      }
    })
  }, observerOptions)

  // Observar todos os elementos com classe reveal-on-scroll
  const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-on-scroll-left, .reveal-on-scroll-right')
  elements.forEach((el) => observer.observe(el))

  return observer
}

