'use client'
import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    let curX = 0, curY = 0
    let targetX = 0, targetY = 0
    let dotX = 0, dotY = 0
    let rafId: number

    const move = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!isVisible) setIsVisible(true)

      // Check if cursor is inside the hero section
      const hero = document.getElementById('hero-section')
      if (hero) {
        const rect = hero.getBoundingClientRect()
        const inHero = e.clientY >= rect.top && e.clientY <= rect.bottom &&
                        e.clientX >= rect.left && e.clientX <= rect.right
        setShowHint(inHero)
      }
    }

    const leave = () => setIsVisible(false)

    const animate = () => {
      // Main cursor: fast follow
      curX += (targetX - curX) * 0.12
      curY += (targetY - curY) * 0.12

      // Dot: slightly faster
      dotX += (targetX - dotX) * 0.28
      dotY += (targetY - dotY) * 0.28

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${curX - 16}px, ${curY - 16}px)`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`
      }
      rafId = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', leave)
    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', leave)
      cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  // Change cursor style on interactive elements
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const addHover = (e: Event) => {
      cursorRef.current?.classList.add('cursor-hover')
      dotRef.current?.classList.add('dot-hover')
    }
    const removeHover = (e: Event) => {
      cursorRef.current?.classList.remove('cursor-hover')
      dotRef.current?.classList.remove('dot-hover')
    }

    const attach = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]').forEach(el => {
        el.addEventListener('mouseenter', addHover)
        el.addEventListener('mouseleave', removeHover)
      })
    }
    attach()
    const obs = new MutationObserver(attach)
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* Main ring cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 32, height: 32,
          border: '1.5px solid rgba(31, 41, 55, 0.55)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s ease, width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
          willChange: 'transform',
          mixBlendMode: 'multiply',
        }}
        className="custom-cursor-ring"
      />

      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          background: '#2F855A',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 100000,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.25s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease',
          willChange: 'transform',
        }}
        className="custom-cursor-dot"
      />

      {/* Scroll hint - visible only inside hero */}
      <div
        ref={hintRef}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          opacity: showHint ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#9CA3AF',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}>
          Scroll to Ride
        </span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 1.5,
                height: 6,
                background: '#2F855A',
                borderRadius: '1px',
                animation: `scrollArrow 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.18}s`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (pointer: fine) {
          *, *::before, *::after { cursor: none !important; }
        }

        .custom-cursor-ring.cursor-hover {
          width: 48px !important;
          height: 48px !important;
          border-color: rgba(47, 133, 90, 0.6) !important;
          background: rgba(47, 133, 90, 0.04);
        }
        .custom-cursor-dot.dot-hover {
          width: 5px !important;
          height: 5px !important;
          background: #2F855A !important;
        }

        @keyframes scrollArrow {
          0%   { opacity: 0; transform: translateY(-4px); }
          50%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(4px); }
        }
      `}</style>
    </>
  )
}
