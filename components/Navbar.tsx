'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LogIn, LogOut, Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    // Load user from storage
    const loadUser = () => {
      const stored = localStorage.getItem('pedalup_user')
      setUser(stored ? JSON.parse(stored) : null)
    }
    loadUser()

    // Scroll handler for navbar background
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Listen to auth state changes
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
        borderBottom: '1px solid #E5E2DF',
        boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.07)' : 'none',
        transition: 'all 0.25s ease',
      }}>
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#1F2937',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            Pedal
          </span>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#2F855A',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            Up
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right side ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Profile pill */}
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 12px 5px 6px',
                  background: '#F8F7F4',
                  borderRadius: '100px',
                  border: '1px solid #E5E2DF',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = '#A8A29E'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = '#E5E2DF'}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#1F2937',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
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
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: '#6B7280',
                  fontSize: '13px',
                  fontWeight: 500,
                  padding: '6px 12px',
                  border: '1px solid #E5E2DF',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.18s ease',
                }}
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = '#1F2937'
                  el.style.borderColor = '#A8A29E'
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = '#6B7280'
                  el.style.borderColor = '#E5E2DF'
                }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#1F2937',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '8px 18px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.18s ease',
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#374151'}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.background = '#1F2937'}
              >
                <LogIn size={13} />
                Sign In
              </button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: '#F8F7F4',
              border: '1px solid #E5E2DF',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: '#1F2937',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0, right: 0,
          background: '#FAFAF9',
          borderBottom: '1px solid #E5E2DF',
          padding: '8px 16px 16px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          animation: 'fadeInUp 0.18s ease',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: pathname === link.href ? '#F0F0EE' : 'transparent',
                color: pathname === link.href ? '#1F2937' : '#6B7280',
                textDecoration: 'none',
                fontWeight: pathname === link.href ? 600 : 500,
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s ease',
                display: 'block',
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'transparent',
                color: '#9B2626',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 500,
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
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
      `}</style>
    </>
  )
}
