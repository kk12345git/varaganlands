import { useEffect, useRef } from 'react'

export function use3DTilt(maxRotate = 8, perspective = 800) {
  const elementRef = useRef(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    // Apply default transitions
    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const mouseX = e.clientX - rect.left - width / 2
      const mouseY = e.clientY - rect.top - height / 2

      // Calculate rotation angles based on cursor offset
      const rX = -(mouseY / (height / 2)) * maxRotate
      const rY = (mouseX / (width / 2)) * maxRotate

      el.style.transition = 'transform 0.1s ease-out, shadow 0.1s ease-out'
      el.style.transform = `perspective(${perspective}px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = () => {
      el.style.transition = 'transform 0.5s ease-out, shadow 0.5s ease-out'
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    }

    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [maxRotate, perspective])

  return elementRef
}
