'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LogIn, LogOut, Menu, X, User } from 'lucide-react'

// Minimal bicycle SVG icon
function BicycleIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="4" cy="12" r="3.2" stroke="#2F855A" strokeWidth="1.5" fill="none"/>
      <circle cx="18" cy="12" r="3.2" stroke="#2F855A" strokeWidth="1.5" fill="none"/>
      {/* Frame */}
      <path d="M4 12 L9 4 L14 4" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 4 L18 12" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 4 L18 12" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 4 L13 7" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Handlebar */}
      <path d="M12 4 L16 4" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Seat */}
      <path d="M7.5 5 L11 5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

// Premium micro-interaction button
function MicroButton({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
  style: extraStyle = {},
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  style?: React.CSSProperties
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const [pressing, setPressing] = useState(false)

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    transition: 'transform 0.15s cubic-bezier(0.16,1,0.3,1), box-shadow 0.15s ease',
    userSelect: 'none',
    ...extraStyle,
  }

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: '#1F2937', color: '#FFFFFF', padding: '8px 18px' }
      : variant === 'secondary'
      ? { background: 'transparent', color: '#6B7280', padding: '6px 12px', border: '1px solid #E5E2DF' }
      : { background: 'transparent', color: '#6B7280', padding: '6px 10px' }

  const handleMouseEnter = () => {
    if (dotRef.current) {
      dotRef.current.style.left = '-8px'
      dotRef.current.style.opacity = '1'
      dotRef.current.style.transition = 'left 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease'
      requestAnimationFrame(() => {
        if (dotRef.current) dotRef.current.style.left = 'calc(100% + 4px)'
      })
    }
  }
  const handleMouseLeave = () => {
    if (dotRef.current) {
      dotRef.current.style.transition = 'opacity 0.15s ease'
      dotRef.current.style.opacity = '0'
      dotRef.current.style.left = '-8px'
    }
    setPressing(false)
  }
  const handleMouseDown = () => setPressing(true)
  const handleMouseUp = () => {
    setPressing(false)
    if (onClick) onClick()
  }

  const content = (
    <button
      ref={btnRef}
      style={{
        ...baseStyle,
        ...variantStyle,
        transform: pressing ? 'scale(0.96)' : 'scale(1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={className}
    >
      {/* Moving dot */}
      <span
        ref={dotRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '-8px',
          transform: 'translateY(-50%)',
          width: 6, height: 6,
          background: variant === 'primary' ? 'rgba(255,255,255,0.6)' : '#2F855A',
          borderRadius: '50%',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.15s ease',
        }}
      />
      {children}
    </button>
  )

  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>
  return content
}

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('pedalup_user')
      setUser(stored ? JSON.parse(stored) : null)
    }
    loadUser()
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleAuth = () => {
      const stored = localStorage.getItem('pedalup_user')
      setUser(stored ? JSON.parse(stored) : null)
    }
    window.addEventListener('storage', handleAuth)
    window.addEventListener('pedalup-auth-change', handleAuth)
    return () => {
      window.removeEventListener('storage', handleAuth)
      window.removeEventListener('pedalup-auth-change', handleAuth)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('pedalup_user')
    localStorage.removeItem('pedalup_session')
    setUser(null)
    setMenuOpen(false)
    window.dispatchEvent(new Event('pedalup-auth-change'))
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/',          label: 'Browse' },
    { href: '/rent',      label: 'Rent' },
    { href: '/post',      label: 'Sell' },
    { href: '/dashboard', label: 'My Listings' },
    { href: '/dashboard', label: 'Profile' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(250, 250, 249, 0.98)' : 'rgba(250, 250, 249, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid #E5E2DF' : '1px solid rgba(229,226,223,0.6)',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <BicycleIcon />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            <span style={{
              fontSize: '16px', fontWeight: 800, color: '#1F2937',
              letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
            }}>Pedal</span>
            <span style={{
              fontSize: '16px', fontWeight: 800, color: '#2F855A',
              letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
            }}>Up</span>
          </div>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`nav-link-premium ${pathname === link.href ? 'active' : ''}`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '7px',
                transition: 'all 0.18s ease',
                color: pathname === link.href ? '#1F2937' : '#6B7280',
                background: pathname === link.href ? 'rgba(31,41,55,0.06)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right side ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              {/* Profile pill */}
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 12px 5px 6px',
                  background: '#F8F7F4', borderRadius: '100px',
                  border: '1px solid #E5E2DF', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#A8A29E'
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#E5E2DF'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#1F2937',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                    {user.name?.split(' ')[0] || 'Student'}
                  </span>
                </div>
              </Link>
              <MicroButton variant="secondary" onClick={handleLogout}>
                <LogOut size={13} />
                Sign out
              </MicroButton>
            </>
          ) : (
            <MicroButton variant="primary" href="/login">
              <LogIn size={13} />
              Sign In
            </MicroButton>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: '#F8F7F4', border: '1px solid #E5E2DF',
              borderRadius: '8px', padding: '7px', cursor: 'pointer',
              color: '#1F2937', display: 'none',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s ease',
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = '#A8A29E'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = '#E5E2DF'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0,
          background: '#FAFAF9', borderBottom: '1px solid #E5E2DF',
          padding: '8px 16px 16px', zIndex: 99,
          display: 'flex', flexDirection: 'column', gap: '2px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          animation: 'fadeInUp 0.18s ease',
        }}>
          {navLinks.map(link => (
            <Link
              key={`mobile-${link.href}-${link.label}`}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 14px', borderRadius: '8px',
                background: pathname === link.href ? '#F0F0EE' : 'transparent',
                color: pathname === link.href ? '#1F2937' : '#6B7280',
                textDecoration: 'none',
                fontWeight: pathname === link.href ? 600 : 500,
                fontSize: '15px', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s ease', display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 14px', borderRadius: '8px',
                background: 'transparent', color: '#9B2626',
                border: 'none', cursor: 'pointer',
                textAlign: 'left', fontWeight: 500, fontSize: '15px',
                fontFamily: 'Inter, sans-serif', display: 'flex',
                alignItems: 'center', gap: '8px', marginTop: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <LogOut size={15} /> Sign out
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        .nav-link-premium:hover {
          color: #1F2937 !important;
          background: rgba(31,41,55,0.05) !important;
        }
      `}</style>
    </>
  )
}
