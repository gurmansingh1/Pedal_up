'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Bike, Plus, MessageSquare, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'

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
    { href: '/',          label: 'Buy' },
    { href: '/rent',      label: 'Rent' },
    { href: '/post',      label: 'Sell' },
    { href: '/chat',      label: 'Inbox' },
    { href: '/dashboard', label: 'My Bazaar' },
  ]

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(15, 23, 42, 0.97)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid rgba(255,255,255,0.04)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
            flexShrink: 0,
          }}>
            <Bike size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Pedal<span style={{ color: 'var(--primary)' }}>Up</span>
          </span>
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
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
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px',
                background: 'rgba(30,41,59,0.8)',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22C55E, #84CC16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name?.split(' ')[0] || 'Student'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '7px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <button
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={14} />
                Sign In
              </button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'none',
              alignItems: 'center', justifyContent: 'center',
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
          top: '64px',
          left: 0, right: 0,
          background: 'rgba(15,23,42,0.98)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border-light)',
          padding: '12px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '13px 16px',
                borderRadius: '10px',
                background: pathname === link.href ? 'rgba(34,197,94,0.1)' : 'transparent',
                color: pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
                border: '1px solid',
                borderColor: pathname === link.href ? 'rgba(34,197,94,0.2)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              style={{
                padding: '13px 16px', borderRadius: '10px',
                background: 'transparent', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.2)',
                cursor: 'pointer', textAlign: 'left',
                fontWeight: 600, fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '4px',
              }}
            >
              <LogOut size={15} /> Logout
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
