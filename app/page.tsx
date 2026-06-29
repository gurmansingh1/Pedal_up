'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, ChevronDown, MapPin, Clock, Star, Shield, Users,
  ArrowRight, Bike, Package, Zap, TrendingUp, CheckCircle,
} from 'lucide-react'

/* ─── Mock listings (used while Supabase not configured) ──────────────────────── */
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
  { icon: Bike,       label: 'Cycles Listed',    value: '120+' },
  { icon: Users,      label: 'TIET Students',     value: '2,400+' },
  { icon: Shield,     label: 'Domain-Verified',   value: '100%' },
  { icon: TrendingUp, label: 'Avg. Savings',      value: '60%' },
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

export default function HomePage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState(30000)

  useEffect(() => {
    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)) },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Only show sale listings on the home page
  const filtered = MOCK_LISTINGS.filter(l => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.brand.toLowerCase().includes(search.toLowerCase()) ||
      l.pickup_location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || l.cycle_type === typeFilter.toLowerCase()
    const matchesPrice = l.price <= maxPrice
    return matchesSearch && matchesType && matchesPrice && l.listing_mode === 'sale'
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ══════════════════════ HERO SECTION ══════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0F172A 0%, #0d1a12 50%, #0F172A 100%)',
      }}>
        {/* Grid overlay */}
        <div className="grid-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

        {/* Glowing orbs */}
        <div style={{
          position: 'absolute',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-10%', left: '-15%',
          animation: 'breathe 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-5%', right: '-10%',
          animation: 'breathe 10s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '40%', right: '20%',
          animation: 'breathe 7s ease-in-out infinite 2s',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 20px 60px',
          textAlign: 'center',
          maxWidth: '860px',
          width: '100%',
        }}>
          {/* Badge */}
          <div
            className="feature-pill animate-fade-in"
            style={{ marginBottom: '32px' }}
          >
            <div className="status-dot" style={{ width: 6, height: 6 }} />
            Exclusively for Thapar Institute Students
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up delay-100"
            style={{
              opacity: 0,
              fontSize: 'clamp(3rem, 7.5vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-3px',
              marginBottom: '12px',
              color: 'var(--text-primary)',
            }}
          >
            Campus Cycles,
          </h1>
          <h1
            className="gradient-text animate-fade-in-up delay-200"
            style={{
              opacity: 0,
              fontSize: 'clamp(3rem, 7.5vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-3px',
              marginBottom: '28px',
            }}
          >
            Reimagined.
          </h1>

          <p
            className="animate-fade-in-up delay-300"
            style={{
              opacity: 0,
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.75,
              marginBottom: '44px',
            }}
          >
            Buy &amp; sell pre-loved bicycles within TIET campus.
            Verified students only · Zero commission · Instant messaging.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in-up delay-400"
            style={{
              opacity: 0,
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '72px',
            }}
          >
            <Link href="#listings">
              <button
                className="btn-primary animate-glow-pulse"
                style={{ padding: '15px 36px', fontSize: '16px', borderRadius: '14px' }}
              >
                Browse for Sale <ArrowRight size={16} style={{ display: 'inline', marginLeft: 6 }} />
              </button>
            </Link>
            <Link href="/rent">
              <button
                className="btn-secondary"
                style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '14px' }}
              >
                Rent a Cycle
              </button>
            </Link>
          </div>

          {/* Premium Bicycle Illustration */}
          <div
            className="animate-fade-in-up delay-500 hero-bike-container"
            style={{ opacity: 0, position: 'relative', width: '100%', maxWidth: 520 }}
          >
            <div className="hero-bike-glow" />
            {/* SVG Bicycle */}
            <svg
              viewBox="0 0 520 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 60px rgba(34,197,94,0.15))' }}
            >
              {/* Rear wheel */}
              <circle cx="130" cy="185" r="80" stroke="rgba(34,197,94,0.25)" strokeWidth="3" fill="none"/>
              <circle cx="130" cy="185" r="65" stroke="rgba(34,197,94,0.15)" strokeWidth="2" fill="none"/>
              <circle cx="130" cy="185" r="10" fill="rgba(34,197,94,0.4)" stroke="rgba(34,197,94,0.7)" strokeWidth="2"/>
              {/* Rear spokes */}
              {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
                const rad = (deg * Math.PI) / 180
                return (
                  <line key={deg}
                    x1={130 + 10 * Math.cos(rad)} y1={185 + 10 * Math.sin(rad)}
                    x2={130 + 65 * Math.cos(rad)} y2={185 + 65 * Math.sin(rad)}
                    stroke="rgba(34,197,94,0.2)" strokeWidth="1.5"
                  />
                )
              })}

              {/* Front wheel */}
              <circle cx="390" cy="185" r="80" stroke="rgba(34,197,94,0.25)" strokeWidth="3" fill="none"/>
              <circle cx="390" cy="185" r="65" stroke="rgba(34,197,94,0.15)" strokeWidth="2" fill="none"/>
              <circle cx="390" cy="185" r="10" fill="rgba(34,197,94,0.4)" stroke="rgba(34,197,94,0.7)" strokeWidth="2"/>
              {/* Front spokes */}
              {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => {
                const rad = (deg * Math.PI) / 180
                return (
                  <line key={deg}
                    x1={390 + 10 * Math.cos(rad)} y1={185 + 10 * Math.sin(rad)}
                    x2={390 + 65 * Math.cos(rad)} y2={185 + 65 * Math.sin(rad)}
                    stroke="rgba(34,197,94,0.2)" strokeWidth="1.5"
                  />
                )
              })}

              {/* Frame — top tube */}
              <path d="M 195 120 L 320 120" stroke="rgba(34,197,94,0.6)" strokeWidth="6" strokeLinecap="round"/>
              {/* Frame — down tube */}
              <path d="M 195 120 L 130 185" stroke="rgba(34,197,94,0.5)" strokeWidth="6" strokeLinecap="round"/>
              {/* Frame — seat tube */}
              <path d="M 260 185 L 195 120" stroke="rgba(34,197,94,0.55)" strokeWidth="6" strokeLinecap="round"/>
              {/* Frame — chain stay */}
              <path d="M 130 185 L 260 185" stroke="rgba(34,197,94,0.45)" strokeWidth="5" strokeLinecap="round"/>
              {/* Fork */}
              <path d="M 320 120 L 390 185" stroke="rgba(34,197,94,0.5)" strokeWidth="5" strokeLinecap="round"/>
              {/* Fork stay */}
              <path d="M 300 140 L 390 185" stroke="rgba(34,197,94,0.4)" strokeWidth="4" strokeLinecap="round"/>

              {/* Head tube */}
              <rect x="312" y="108" width="16" height="32" rx="6" fill="rgba(34,197,94,0.5)" stroke="rgba(34,197,94,0.8)" strokeWidth="1.5"/>
              {/* Seat tube top */}
              <rect x="188" y="108" width="14" height="28" rx="5" fill="rgba(34,197,94,0.45)" stroke="rgba(34,197,94,0.7)" strokeWidth="1.5"/>

              {/* Handlebar */}
              <path d="M 320 105 Q 340 88 355 95" stroke="rgba(34,197,94,0.7)" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <circle cx="356" cy="94" r="6" fill="rgba(34,197,94,0.5)" stroke="rgba(34,197,94,0.9)" strokeWidth="2"/>

              {/* Saddle */}
              <path d="M 172 110 Q 195 102 218 110" stroke="rgba(34,197,94,0.8)" strokeWidth="6" strokeLinecap="round" fill="none"/>

              {/* Pedal crank */}
              <circle cx="260" cy="185" r="16" stroke="rgba(34,197,94,0.4)" strokeWidth="2" fill="rgba(34,197,94,0.06)"/>
              <line x1="244" y1="185" x2="276" y2="185" stroke="rgba(34,197,94,0.5)" strokeWidth="3"/>
              <circle cx="244" cy="185" r="5" fill="rgba(34,197,94,0.6)"/>
              <circle cx="276" cy="185" r="5" fill="rgba(34,197,94,0.6)"/>

              {/* Chain */}
              <path d="M 130 185 Q 195 200 260 185" stroke="rgba(34,197,94,0.2)" strokeWidth="2" strokeDasharray="4,3" fill="none"/>

              {/* Ground shadow */}
              <ellipse cx="260" cy="270" rx="160" ry="8" fill="rgba(34,197,94,0.06)"/>
            </svg>

            {/* Floating info chips */}
            <div style={{
              position: 'absolute', top: -10, right: -20,
              background: 'rgba(30,41,59,0.9)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '12px',
              padding: '10px 16px',
              backdropFilter: 'blur(16px)',
              animation: 'float 4s ease-in-out infinite',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Listed now</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>₹8,500</div>
            </div>
            <div style={{
              position: 'absolute', bottom: 20, left: -20,
              background: 'rgba(30,41,59,0.9)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '12px',
              padding: '10px 16px',
              backdropFilter: 'blur(16px)',
              animation: 'float 5s ease-in-out infinite 1s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="var(--primary)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Verified Seller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          zIndex: 10,
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: 24, height: 38,
            border: '1.5px solid var(--border-light)',
            borderRadius: '12px',
            display: 'flex', justifyContent: 'center', paddingTop: '6px',
          }}>
            <div style={{
              width: 4, height: 8,
              background: 'var(--primary)',
              borderRadius: '2px',
              animation: 'slideDown 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS SECTION ══════════════════════ */}
      <section style={{ padding: '80px 20px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '20px' }}>
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="reveal card"
                style={{ padding: '28px 24px', textAlign: 'center', animationDelay: `${i * 0.1}s` }}
              >
                <div style={{
                  width: 48, height: 48,
                  background: 'rgba(34,197,94,0.1)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}>
                  <stat.icon size={22} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{stat.value}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section style={{ padding: '100px 20px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="feature-pill" style={{ margin: '0 auto 20px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '12px' }}>
              Simple, Safe &amp; Fast
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
              No middlemen, no fees. Just honest student-to-student deals on campus.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="reveal card" style={{ padding: '32px', animationDelay: `${i * 0.12}s` }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <step.icon size={20} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: 'rgba(34,197,94,0.2)', letterSpacing: '-1px' }}>
                    {step.step}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ LISTINGS SECTION ══════════════════════ */}
      <section id="listings" style={{ padding: '80px 20px 120px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="reveal" style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 3, height: 28, background: 'var(--primary)', borderRadius: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Cycles for Sale
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '8px' }}>
                  Buy a Cycle
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                  {filtered.length} cycles available for purchase
                </p>
              </div>
              <Link href="/rent">
                <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={15} /> Browse Rentals →
                </button>
              </Link>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="reveal glass" style={{ borderRadius: '16px', padding: '20px 24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Search by brand, title, hostel..."
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
                  style={{ cursor: 'pointer', appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low→High</option>
                  <option value="price_desc">Price: High→Low</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
              {/* Price range */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Max: {formatPrice(maxPrice)}
                </span>
                <input
                  type="range" min={1000} max={30000} step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
            {/* Type filters */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(t => (
                <button
                  key={t}
                  className={`tag-pill ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Listings grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
              <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.4, display: 'block' }} />
              <p style={{ fontSize: '18px', fontWeight: 600 }}>No cycles found</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filtered.map((listing, i) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="listing-card reveal"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%)',
                      }} />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span className="badge badge-accent">{listing.cycle_type}</span>
                      </div>
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <span className={`badge ${CONDITION_COLORS[listing.condition]}`}>
                          {CONDITION_LABELS[listing.condition]}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
                        {listing.title}
                      </h3>
                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {listing.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div className="price-tag">{formatPrice(listing.price)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                              <MapPin size={11} />
                              {listing.pickup_location}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                              <Clock size={11} />
                              {timeAgo(listing.created_at)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          width: 36, height: 36,
                          background: 'rgba(34,197,94,0.1)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)' }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)' }}
                        >
                          <ArrowRight size={15} color="var(--primary)" />
                        </div>
                      </div>

                      {/* Seller */}
                      <div style={{
                        marginTop: '14px', paddingTop: '14px',
                        borderTop: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                            {listing.seller_name.charAt(0)}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{listing.seller_name}</span>
                        <span className="badge badge-primary" style={{ marginLeft: 'auto', fontSize: '10px' }}>
                          <Shield size={8} /> Verified
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
          100% { transform: translateY(12px); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
