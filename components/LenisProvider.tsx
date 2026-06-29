'use client'
import { useEffect } from 'react'

export default function LenisProvider() {
  useEffect(() => {
    let lenis: any
    let rafId: number

    const init = async () => {
      try {
        const { default: Lenis } = await import('lenis')
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 2,
          infinite: false,
        })

        const raf = (time: number) => {
          lenis.raf(time)
          rafId = requestAnimationFrame(raf)
        }
        rafId = requestAnimationFrame(raf)

        // Expose lenis for GSAP ScrollTrigger sync
        ;(window as any).__lenis = lenis
      } catch (e) {
        // Lenis unavailable — native scroll
      }
    }

    init()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (lenis) lenis.destroy()
    }
  }, [])

  return null
}
