'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Search, ChevronDown, MapPin, Clock, Shield, Users,
  ArrowRight, Bike, Package, Zap, TrendingUp, CheckCircle,
} from 'lucide-react'

// Dynamically import 3D component (no SSR)
const Cycle3D = dynamic(() => import('@/components/Cycle3D'), { ssr: false })

/* ─── Mock listings ────────────────────────────────────────────────────────── */
const MOCK_LISTINGS = [
  {
    id: 'listing-uuid-1',
    title: 'Firefox Target 21-Speed Hybrid',
    description: 'Perfect condition Firefox hybrid cycle. Bought 10 months ago, used mostly for commuting from JGB hostel. Smooth gear shifts, dual disc brakes, recently serviced.',
    brand: 'Firefox',
    cycle_type: 'hybrid',
    condition: 'like_new',
    price: 8500,
    age_months: 10,
    pickup_location: 'JGB Hostel Parking',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Aman Verma',
    seller_hostel: 'JGB',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T12:00:00.000Z',
  },
  {
    id: 'listing-uuid-2',
    title: 'Atlas Asteroid Mountain Bike',
    description: 'Sturdy mountain bike, great suspension, wide tires with excellent grip. Ideal for TIET campus pathways. Giving away because graduating.',
    brand: 'Atlas',
    cycle_type: 'mountain',
    condition: 'good',
    price: 4200,
    age_months: 24,
    pickup_location: 'MGG Hostel Gate',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Simran Kaur',
    seller_hostel: 'MGG',
    image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T13:00:00.000Z',
  },
  {
    id: 'listing-uuid-3',
    title: 'Btwin Triban RC100 Road Bike',
    description: 'High quality road bike from Decathlon. Lightweight alloy frame, Shimano shifter, very fast and light. Tires upgraded to puncture-resistant continental ones.',
    brand: 'Decathlon',
    cycle_type: 'road',
    condition: 'good',
    price: 14000,
    age_months: 15,
    pickup_location: 'JGB Block A',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Aman Verma',
    seller_hostel: 'JGB',
    image_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T14:00:00.000Z',
  },
  {
    id: 'listing-uuid-4',
    title: 'Hero Sprint 26T City Cycle',
    description: 'Reliable everyday commuter. Perfect for getting around campus. Minimal maintenance done, tyres and brakes in good shape.',
    brand: 'Hero',
    cycle_type: 'city',
    condition: 'fair',
    price: 2800,
    age_months: 36,
    pickup_location: 'Kailash Hostel',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Ranjit Singh',
    seller_hostel: 'Kailash',
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-22T11:00:00.000Z',
  },
  {
    id: 'listing-uuid-5',
    title: 'Avon Cyclone Folding Bicycle',
    description: 'Compact folding bicycle, extremely handy for hostel storage. Carries up to 100kg. Great condition, barely used.',
    brand: 'Avon',
    cycle_type: 'folding',
    condition: 'like_new',
    price: 6500,
    age_months: 8,
    pickup_location: 'P-Block',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Priya Sharma',
    seller_hostel: 'Girls Hostel',
    image_url: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-21T09:00:00.000Z',
  },
  {
    id: 'listing-uuid-6',
    title: 'Trek FX3 Fitness Hybrid',
    description: 'Premium Trek fitness bike. Lightweight aluminum frame, hydraulic disc brakes. Used for just 5 months. One of the best cycles on campus.',
    brand: 'Trek',
    cycle_type: 'hybrid',
    condition: 'like_new',
    price: 22000,
    age_months: 5,
    pickup_location: 'Vishwakarma Hostel',
    status: 'active',
    listing_mode: 'sale',
    seller_name: 'Dhruv Malhotra',
    seller_hostel: 'Vishwakarma',
    image_url: 'https://images.unsplash.com/photo-1565185693497-e41f93432f89?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-20T16:00:00.000Z',
  },
]

const CONDITION_LABELS: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const CONDITION_COLORS: Record<string, string> = {
  like_new: 'badge-primary',
  good: 'badge-accent',
  fair: 'badge-yellow',
  poor: 'badge-red',
}

const TYPE_FILTERS = ['All', 'Hybrid', 'Mountain', 'Road', 'City', 'Folding']

const STATS = [
  { icon: Bike, label: 'Cycles Listed', value: '120+' },
  { icon: Users, label: 'TIET Students', value: '2,400+' },
  { icon: Shield, label: 'Domain-Verified', value: '100%' },
  { icon: TrendingUp, label: 'Avg. Savings', value: '60%' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Verify your @thapar.edu email',
    desc: 'Sign in with your Thapar Institute email. No outsiders, no scammers — just verified TIET students.',
    icon: Shield,
  },
  {
    step: '02',
    title: 'Browse or list cycles',
    desc: 'Explore dozens of real listings from your hostel neighbours, or post your own in under 3 minutes.',
    icon: Bike,
  },
  {
    step: '03',
    title: 'Message & meet on campus',
    desc: 'Chat directly with sellers, negotiate, inspect, and close the deal at a convenient campus spot.',
    icon: Zap,
  },
]

/* ─── Premium Micro Button ──────────────────────────────────────────────────── */
function MicroBtn({
  children,
  onClick,
  variant = 'primary',
  id,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  id?: string
}) {
  const dotRef = useRef<HTMLSpanElement>(null)
  const [pressing, setPressing] = useState(false)

  const fireHover = () => {
    if (!dotRef.current) return
    const dot = dotRef.current
    dot.style.transition = 'none'
    dot.style.left = '-8px'
    dot.style.opacity = '1'
    // Force reflow
    void dot.offsetWidth
    dot.style.transition = 'left 0.38s cubic-bezier(0.16,1,0.3,1)'
    dot.style.left = 'calc(100% + 8px)'
  }

  const clearHover = () => {
    if (!dotRef.current) return
    dotRef.current.style.transition = 'opacity 0.18s ease'
    dotRef.current.style.opacity = '0'
    dotRef.current.style.left = '-8px'
    setPressing(false)
  }

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: '15px',
    letterSpacing: '-0.1px',
    cursor: 'pointer',
    borderRadius: '10px',
    userSelect: 'none',
    transition: 'transform 0.15s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s ease',
    transform: pressing ? 'scale(0.97)' : 'scale(1)',
    WebkitTapHighlightColor: 'transparent',
  }

  const variantStyle: React.CSSProperties =
    variant === 'primary'
      ? { background: '#1F2937', color: '#FFFFFF', padding: '14px 28px', border: 'none' }
      : { background: 'transparent', color: '#1F2937', padding: '13px 24px', border: '1.5px solid #D6D3D1' }

  return (
    <button
      id={id}
      style={{ ...baseStyle, ...variantStyle }}
      onMouseEnter={fireHover}
      onMouseLeave={clearHover}
      onMouseDown={() => setPressing(true)}
      onMouseUp={() => { setPressing(false); if (onClick) onClick() }}
      onTouchStart={() => setPressing(true)}
      onTouchEnd={() => { setPressing(false); if (onClick) onClick() }}
    >
      <span
        ref={dotRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '-8px',
          transform: 'translateY(-50%)',
          width: 6,
          height: 6,
          background: variant === 'primary' ? 'rgba(255,255,255,0.55)' : '#2F855A',
          borderRadius: '50%',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      {children}
    </button>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState(30000)
  const heroRef = useRef<HTMLElement>(null)
  const marketplaceRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const howRef = useRef<HTMLElement>(null)

  // ── Scroll reveal observer ───────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)) },
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ── GSAP Scroll-driven hero exit + marketplace entrance ─────────────────
  useEffect(() => {
    let gsap: any
    let scrollTrigger: any
    let cleanup: () => void

    const initGSAP = async () => {
      try {
        const gsapMod = await import('gsap')
        const stMod = await import('gsap/ScrollTrigger')
        gsap = gsapMod.gsap || gsapMod.default
        scrollTrigger = stMod.ScrollTrigger
        if (!gsap || !scrollTrigger) return

        gsap.registerPlugin(scrollTrigger)

        const hero = heroRef.current
        const marketplace = marketplaceRef.current
        const stats = statsRef.current
        const how = howRef.current
        if (!hero) return

        // Hero exit: slides up + fades out as user scrolls
        gsap.to(hero, {
          yPercent: -18,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })

        // Stats section entrance
        if (stats) {
          gsap.from(stats, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: stats,
              start: 'top 85%',
              once: true,
            },
          })
        }

        cleanup = () => {
          scrollTrigger.getAll().forEach((t: any) => t.kill())
        }
      } catch (e) {
        // GSAP unavailable — graceful fallback
        console.warn('[PedalUp] GSAP not loaded, using native scroll')
      }
    }

    initGSAP()
    return () => { if (cleanup) cleanup() }
  }, [])

  // ── Listings filter ──────────────────────────────────────────────────────
  const filtered = MOCK_LISTINGS.filter(l => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.brand.toLowerCase().includes(search.toLowerCase()) ||
      l.pickup_location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || l.cycle_type === typeFilter.toLowerCase()
    const matchesPrice = l.price <= maxPrice
    const matchesMode = l.listing_mode === 'sale'
    return matchesSearch && matchesType && matchesPrice && matchesMode
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price
    if (sortBy === 'price_desc') return b.price - a.price
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`
  const timeAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#E7E5E4' }}>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section
        id="hero-section"
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#FAFAF9',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          willChange: 'transform, opacity',
        }}
      >
        {/* Subtle warm texture dots */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(#D6D3D1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.45,
        }} />

        {/* Soft green ambient blob */}
        <div style={{
          position: 'absolute',
          width: 560, height: 560,
          background: 'radial-gradient(circle, rgba(47, 133, 90, 0.07) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-100px', right: '-80px',
          pointerEvents: 'none',
        }} />
        {/* Warm amber blob */}
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-60px', left: '-80px',
          pointerEvents: 'none',
        }} />

        {/* ── Hero inner layout ─────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 40px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center',
        }}>

          {/* ── Left: Text content ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

            {/* Label chip */}
            <div className="feature-pill animate-fade-in" style={{ marginBottom: '28px' }}>
              <div className="status-dot" style={{ width: 6, height: 6 }} />
              Exclusively for @thapar.edu students
            </div>

            {/* Main title */}
            <h1
              className="animate-fade-in-up delay-100"
              style={{
                opacity: 0,
                fontSize: 'clamp(3.2rem, 7vw, 5.8rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-4px',
                color: '#1F2937',
                marginBottom: '24px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              PEDAL
              <br />
              <span style={{ color: '#2F855A' }}>UP</span>
            </h1>

            {/* Subtitle */}
            <p
              className="animate-fade-in-up delay-200"
              style={{
                opacity: 0,
                fontSize: '18px',
                color: '#6B7280',
                maxWidth: '440px',
                lineHeight: 1.7,
                marginBottom: '40px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Buy, Sell and Rent Cycles within
              Thapar Campus — verified students only.
            </p>

            {/* CTA buttons */}
            <div
              className="animate-fade-in-up delay-300"
              style={{ opacity: 0, display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '56px' }}
            >
              <a href="#listings">
                <MicroBtn variant="primary" id="hero-browse-btn">
                  Browse Cycles
                  <ArrowRight size={15} />
                </MicroBtn>
              </a>
              <Link href="/post" style={{ textDecoration: 'none' }}>
                <MicroBtn variant="secondary" id="hero-sell-btn">
                  Sell Your Cycle
                </MicroBtn>
              </Link>
            </div>

            {/* Floating stat chips */}
            <div
              className="animate-fade-in-up delay-400"
              style={{ opacity: 0, display: 'flex', gap: '12px', flexWrap: 'wrap' }}
            >
              {[
                { value: '120+', label: 'Cycles listed' },
                { value: '2,400+', label: 'TIET students' },
                { value: 'Free', label: 'Zero commission' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E2DF',
                    borderRadius: '10px',
                    padding: '12px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: 3D Rider Scene ─────────────────────── */}
          <div
            className="animate-fade-in delay-300"
            style={{
              opacity: 0,
              position: 'relative',
              height: '520px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(214, 211, 209, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
            <Cycle3D />
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          zIndex: 10,
          animation: 'breathe 2.2s ease-in-out infinite',
        }}>
          <span style={{
            fontSize: '10px',
            color: '#B0A89E',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}>
            Scroll to Ride
          </span>
          <div style={{
            width: 22, height: 36,
            border: '1.5px solid #D6D3D1',
            borderRadius: '11px',
            display: 'flex', justifyContent: 'center', paddingTop: '6px',
          }}>
            <div style={{
              width: 3, height: 7,
              background: '#2F855A',
              borderRadius: '2px',
              animation: 'slideDown 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS SECTION ══════════════════════ */}
      <section ref={statsRef} style={{ padding: '80px 40px', background: '#F8F7F4', borderTop: '1px solid #E5E2DF', borderBottom: '1px solid #E5E2DF' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="reveal"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E2DF',
                  borderRadius: '12px',
                  padding: '28px 24px',
                  textAlign: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  animationDelay: `${i * 0.08}s`,
                  transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-3px)'
                  el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'
                  el.style.borderColor = '#C5C2BE'
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  el.style.borderColor = '#E5E2DF'
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: 'rgba(47, 133, 90, 0.08)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  border: '1px solid rgba(47, 133, 90, 0.15)',
                }}>
                  <stat.icon size={20} color="#2F855A" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#1F2937', letterSpacing: '-1px', fontFamily: 'Inter, sans-serif' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section ref={howRef} style={{ padding: '100px 40px', background: '#E7E5E4', borderBottom: '1px solid #D6D3D1' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="feature-pill" style={{ margin: '0 auto 20px' }}>How It Works</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-1.5px',
              marginBottom: '12px',
              color: '#1F2937',
              fontFamily: 'Inter, sans-serif',
            }}>
              Simple, Safe & Fast
            </h2>
            <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
              No middlemen, no fees. Honest student-to-student deals on campus.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="reveal"
                style={{
                  background: '#FAFAF9',
                  border: '1px solid #E5E2DF',
                  borderRadius: '14px',
                  padding: '32px 28px',
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
                  el.style.borderColor = '#A8A29E'
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  el.style.borderColor = '#E5E2DF'
                }}
              >
                <div style={{
                  position: 'absolute', top: '12px', right: '20px',
                  fontSize: '80px', fontWeight: 900, color: '#E7E5E4',
                  letterSpacing: '-4px', lineHeight: 1,
                  fontFamily: 'Inter, sans-serif', userSelect: 'none',
                }}>
                  {step.step}
                </div>
                <div style={{
                  width: 44, height: 44,
                  background: 'rgba(47, 133, 90, 0.08)',
                  border: '1px solid rgba(47, 133, 90, 0.18)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', flexShrink: 0,
                }}>
                  <step.icon size={20} color="#2F855A" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, fontFamily: 'Inter, sans-serif' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ MARKETPLACE SECTION ══════════════════════ */}
      <section id="listings" ref={marketplaceRef} style={{ padding: '80px 40px 120px', background: '#F8F7F4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="reveal" style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#2F855A', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                  Marketplace
                </p>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1.5px', color: '#1F2937', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>
                  Cycles for Sale
                </h2>
                <p style={{ color: '#9CA3AF', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
                  {MOCK_LISTINGS.length} cycles available from TIET students
                </p>
              </div>
              <Link href="/rent" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    background: '#FFFFFF', color: '#1F2937', fontSize: '13px', fontWeight: 600,
                    padding: '10px 18px', border: '1px solid #D6D3D1', borderRadius: '9px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
                  }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#A8A29E'
                    el.style.transform = 'translateY(-1px)'
                    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#D6D3D1'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <Package size={14} />
                  Browse Rentals
                  <ArrowRight size={13} />
                </button>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div
            className="reveal"
            style={{
              background: '#FFFFFF', border: '1px solid #E5E2DF', borderRadius: '14px',
              padding: '20px 22px', marginBottom: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: '40px', fontSize: '14px' }}
                  placeholder="Search by brand, title or hostel..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Sort */}
              <div style={{ position: 'relative', minWidth: '160px' }}>
                <select
                  className="input-field"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  style={{ cursor: 'pointer', appearance: 'none', paddingRight: '36px', fontSize: '14px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
              {/* Price range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '210px' }}>
                <span style={{ fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Max: {formatPrice(maxPrice)}
                </span>
                <input
                  type="range" min={1000} max={30000} step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2F855A' }}
                />
              </div>
            </div>
            {/* Type filter chips */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(t => (
                <button
                  key={t}
                  className={`tag-pill ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                  style={{ fontSize: '13px' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Listings grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <Package size={44} style={{ margin: '0 auto 16px', opacity: 0.25, display: 'block', color: '#6B7280' }} />
              <p style={{ fontSize: '17px', fontWeight: 600, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>No cycles found</p>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>Try adjusting your filters or price range</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filtered.map((listing, i) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="reveal listing-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: '210px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)',
                        pointerEvents: 'none',
                      }} />
                      {/* Badges */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        <span style={{
                          background: 'rgba(255,255,255,0.92)',
                          color: '#1F2937', fontSize: '10px', fontWeight: 600,
                          padding: '3px 8px', borderRadius: '5px',
                          textTransform: 'capitalize', fontFamily: 'Inter, sans-serif',
                          letterSpacing: '0.3px', backdropFilter: 'blur(4px)',
                        }}>
                          {listing.cycle_type}
                        </span>
                      </div>
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <span className={`badge ${CONDITION_COLORS[listing.condition]}`}
                          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', fontSize: '10px' }}>
                          {CONDITION_LABELS[listing.condition]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', marginBottom: '5px', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
                        {listing.title}
                      </h3>
                      <p style={{
                        fontSize: '13px', color: '#9CA3AF', lineHeight: 1.55, marginBottom: '14px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {listing.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
                            {formatPrice(listing.price)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                              <MapPin size={11} />
                              {listing.pickup_location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                              <Clock size={11} />
                              {timeAgo(listing.created_at)}
                            </div>
                          </div>
                        </div>
                        {/* Arrow button */}
                        <div
                          style={{
                            width: 36, height: 36, background: '#F8F7F4',
                            border: '1px solid #E5E2DF', borderRadius: '9px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease', flexShrink: 0,
                          }}
                          onMouseOver={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = '#1F2937'
                            el.style.borderColor = '#1F2937'
                          }}
                          onMouseOut={e => {
                            const el = e.currentTarget as HTMLElement
                            el.style.background = '#F8F7F4'
                            el.style.borderColor = '#E5E2DF'
                          }}
                        >
                          <ArrowRight size={14} color="#6B7280" />
                        </div>
                      </div>

                      {/* Seller row */}
                      <div style={{
                        marginTop: '14px', paddingTop: '13px',
                        borderTop: '1px solid #F0EFED',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: '#1F2937',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                            {listing.seller_name.charAt(0)}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          {listing.seller_name}
                        </span>
                        <span style={{
                          marginLeft: 'auto',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(47, 133, 90, 0.08)',
                          color: '#2F855A', fontSize: '10px', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '4px',
                          border: '1px solid rgba(47, 133, 90, 0.15)',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          <Shield size={9} />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes slideDown {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @media (max-width: 900px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > div > div[style*="height: 520px"] {
            height: 340px !important;
          }
        }
      `}</style>
    </div>
  )
}
