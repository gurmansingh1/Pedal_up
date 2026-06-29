'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, ChevronDown, MapPin, Clock, Shield, ArrowRight,
  Bike, Calendar, CheckCircle, XCircle, Package, IndianRupee,
} from 'lucide-react'

const MOCK_RENTALS = [
  {
    id: 'rental-uuid-1',
    title: 'Hero Sprint City Cycle — Daily Rental',
    description:
      'Clean, well-maintained city cycle available for rent. Perfect for daily commute around TIET campus. Fresh tyres, serviced brakes.',
    brand: 'Hero',
    cycle_type: 'city',
    condition: 'good',
    rent_per_day: 60,
    rent_per_week: 350,
    rent_per_month: 1100,
    security_deposit: 500,
    min_rental_days: 1,
    is_available: true,
    pickup_location: 'JGB Hostel Gate',
    seller_name: 'Ananya Gupta',
    seller_hostel: 'Girls Hostel',
    age_months: 24,
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-25T10:00:00.000Z',
  },
  {
    id: 'rental-uuid-2',
    title: 'Atlas Granite MTB for Rent',
    description:
      'Robust mountain bike, ideal for weekend rides. Good suspension and grip. Minimum rental 2 days.',
    brand: 'Atlas',
    cycle_type: 'mountain',
    condition: 'good',
    rent_per_day: 80,
    rent_per_week: 450,
    rent_per_month: 1500,
    security_deposit: 800,
    min_rental_days: 2,
    is_available: true,
    pickup_location: 'Kailash Hostel Parking',
    seller_name: 'Harpreet Sidhu',
    seller_hostel: 'Kailash',
    age_months: 18,
    image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-24T14:00:00.000Z',
  },
  {
    id: 'rental-uuid-3',
    title: 'Firefox Hybrid — Weekly / Monthly Rental',
    description:
      'Firefox hybrid available for longer-term rental. Smooth 21-speed gear. Disc brakes. Includes a free front basket.',
    brand: 'Firefox',
    cycle_type: 'hybrid',
    condition: 'like_new',
    rent_per_day: 100,
    rent_per_week: 600,
    rent_per_month: 2000,
    security_deposit: 1000,
    min_rental_days: 3,
    is_available: true,
    pickup_location: 'MGG Hostel B-Wing',
    seller_name: 'Deepika Nair',
    seller_hostel: 'MGG',
    age_months: 12,
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-23T08:00:00.000Z',
  },
  {
    id: 'rental-uuid-4',
    title: 'Avon Folding Bike — Rent by the Day',
    description:
      'Super portable folding bike, great for short trips between blocks. Fits under any hostel bed. No deposit required.',
    brand: 'Avon',
    cycle_type: 'folding',
    condition: 'good',
    rent_per_day: 50,
    rent_per_week: 280,
    rent_per_month: undefined,
    security_deposit: 0,
    min_rental_days: 1,
    is_available: false,
    pickup_location: 'P-Block Room 214',
    seller_name: 'Kunal Mehta',
    seller_hostel: 'Vishwakarma',
    age_months: 10,
    image_url: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-22T16:00:00.000Z',
  },
  {
    id: 'rental-uuid-5',
    title: 'Decathlon Road Bike — Exam Season Special',
    description:
      'Lightweight road bike, perfect for fast campus commutes. Minimum 7-day rental. Great for longer exam-season use.',
    brand: 'Decathlon',
    cycle_type: 'road',
    condition: 'like_new',
    rent_per_day: 120,
    rent_per_week: 700,
    rent_per_month: 2400,
    security_deposit: 1500,
    min_rental_days: 7,
    is_available: true,
    pickup_location: 'Q-Block Hostel',
    seller_name: 'Rahul Kapoor',
    seller_hostel: 'Q-Block',
    age_months: 6,
    image_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=600&q=80',
    created_at: '2026-06-21T11:00:00.000Z',
  },
]

const TYPE_FILTERS = ['All', 'Hybrid', 'Mountain', 'Road', 'City', 'Folding']
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

const formatRent = (n: number) => `₹${n.toLocaleString('en-IN')}`
const timeAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days}d ago`
}

export default function RentPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [maxPerDay, setMaxPerDay] = useState(200)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const filtered = MOCK_RENTALS.filter(l => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.brand.toLowerCase().includes(search.toLowerCase()) ||
      l.pickup_location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || l.cycle_type === typeFilter.toLowerCase()
    const matchesPrice = l.rent_per_day <= maxPerDay
    const matchesAvail = !availableOnly || l.is_available
    return matchesSearch && matchesType && matchesPrice && matchesAvail
  }).sort((a, b) => {
    if (sortBy === 'price_asc')  return a.rent_per_day - b.rent_per_day
    if (sortBy === 'price_desc') return b.rent_per_day - a.rent_per_day
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div style={{ minHeight: '100vh', background: '#E7E5E4' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: '100px 20px 72px',
        overflow: 'hidden',
        background: '#FAFAF9',
        textAlign: 'center',
        borderBottom: '1px solid #E5E2DF',
      }}>
        {/* Dot texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#D6D3D1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5, pointerEvents: 'none' }} />
        {/* Ambient blobs */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(47,133,90,0.06) 0%, transparent 70%)',
          borderRadius: '50%', top: '-80px', right: '-60px', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(217,119,6,0.04) 0%, transparent 70%)',
          borderRadius: '50%', bottom: '-40px', left: '-60px', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto' }}>
          <div className="feature-pill animate-fade-in" style={{ margin: '0 auto 24px' }}>
            <Calendar size={13} />
            Cycle Rentals · TIET Campus
          </div>
          <h1 className="animate-fade-in-up delay-100"
            style={{ opacity: 0, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.05, marginBottom: '18px', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
            Rent a Cycle,{' '}
            <span style={{ color: '#2F855A' }}>Pay Per Day</span>
          </h1>
          <p className="animate-fade-in-up delay-200"
            style={{ opacity: 0, fontSize: '16px', color: '#6B7280', lineHeight: 1.75, maxWidth: '480px', margin: '0 auto 36px', fontFamily: 'Inter, sans-serif' }}>
            Short-term or semester-long — find verified cycle owners who rent at student-friendly rates.
          </p>
          <div className="animate-fade-in-up delay-300" style={{ opacity: 0, display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/post">
              <button className="btn-primary" style={{ padding: '12px 28px' }}>
                List Your Cycle for Rent
              </button>
            </Link>
            <Link href="/">
              <button className="btn-secondary" style={{ padding: '12px 24px' }}>
                Browse for Sale →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E5E2DF',
        borderBottom: '1px solid #E5E2DF',
        padding: '20px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Listed for Rent',   value: `${MOCK_RENTALS.length}` },
            { label: 'Currently Available', value: `${MOCK_RENTALS.filter(r => r.is_available).length}` },
            { label: 'Starting From',     value: `₹${Math.min(...MOCK_RENTALS.map(r => r.rent_per_day))}/day` },
            { label: 'TIET Verified',     value: '100%' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#2F855A', fontFamily: 'Inter, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Listings section ──────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 20px 100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Section header */}
          <div className="reveal" style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 3, height: 28, background: 'var(--accent)', borderRadius: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                Rental Listings
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '8px' }}>
              Cycles Available to Rent
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              {filtered.length} rental{filtered.length === 1 ? '' : 's'} found
            </p>
          </div>

          {/* Filters */}
          <div className="reveal glass" style={{ borderRadius: '16px', padding: '20px 24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  className="input-field" style={{ paddingLeft: '40px' }}
                  placeholder="Search brand, location..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Sort */}
              <div style={{ position: 'relative', minWidth: '160px' }}>
                <select
                  className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{ cursor: 'pointer', appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Rate: Low→High</option>
                  <option value="price_desc">Rate: High→Low</option>
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
              </div>
              {/* Max rate slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '210px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Max: ₹{maxPerDay}/day
                </span>
                <input type="range" min={20} max={200} step={10}
                  value={maxPerDay} onChange={e => setMaxPerDay(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent)' }}
                />
              </div>
              {/* Available only toggle */}
              <button
                onClick={() => setAvailableOnly(a => !a)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: availableOnly ? 'rgba(34,197,94,0.12)' : 'var(--bg-elevated)',
                  color: availableOnly ? 'var(--primary)' : 'var(--text-secondary)',
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
                  border: `1px solid ${availableOnly ? 'rgba(34,197,94,0.3)' : 'var(--border-light)'}`,
                  transition: 'all 0.2s ease',
                }}
              >
                <CheckCircle size={14} />
                Available Only
              </button>
            </div>
            {/* Type pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(t => (
                <button key={t}
                  className={`tag-pill ${typeFilter === t ? 'active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Rental cards */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
              <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.4, display: 'block' }} />
              <p style={{ fontSize: '18px', fontWeight: 600 }}>No rentals found</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
              {filtered.map((listing, i) => (
                <Link key={listing.id} href={`/listing/${listing.id}`} style={{ textDecoration: 'none' }}>
                  <div className="listing-card reveal" style={{ animationDelay: `${i * 0.06}s` }}>
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

                      {/* Availability badge */}
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: listing.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1px solid ${listing.is_available ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                        color: listing.is_available ? '#22c55e' : '#ef4444',
                        backdropFilter: 'blur(8px)',
                      }}>
                        {listing.is_available
                          ? <><CheckCircle size={10} /> Available</>
                          : <><XCircle size={10} /> Rented Out</>
                        }
                      </div>

                      {/* Type badge */}
                      <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                        <span className={`badge ${CONDITION_COLORS[listing.condition]}`}>
                          {listing.cycle_type}
                        </span>
                      </div>

                      {/* RENT label */}
                      <div style={{
                        position: 'absolute', bottom: '12px', right: '12px',
                        background: 'rgba(132,204,22,0.15)',
                        border: '1px solid rgba(132,204,22,0.4)',
                        borderRadius: '6px', padding: '3px 8px',
                        fontSize: '10px', fontWeight: 800, color: '#84cc16',
                        backdropFilter: 'blur(8px)', letterSpacing: '0.5px',
                      }}>
                        FOR RENT
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

                      {/* Pricing */}
                      <div style={{
                        background: 'rgba(132,204,22,0.05)',
                        border: '1px solid rgba(132,204,22,0.15)',
                        borderRadius: '10px', padding: '12px 14px', marginBottom: '14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
                            {formatRent(listing.rent_per_day)}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>/day</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {listing.rent_per_week && (
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                              {formatRent(listing.rent_per_week)}<span style={{ color: 'var(--text-tertiary)' }}>/wk</span>
                            </span>
                          )}
                          {listing.rent_per_month && (
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                              {formatRent(listing.rent_per_month)}<span style={{ color: 'var(--text-tertiary)' }}>/mo</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        {(listing.security_deposit ?? 0) > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <Shield size={11} />
                            ₹{listing.security_deposit} deposit
                          </div>
                        )}
                        {(listing.security_deposit ?? 0) === 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)' }}>
                            <CheckCircle size={11} />
                            No deposit
                          </div>
                        )}
                        {(listing.min_rental_days ?? 1) > 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <Calendar size={11} />
                            Min {listing.min_rental_days} days
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <MapPin size={11} />
                          {listing.pickup_location}
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{
                        paddingTop: '12px', borderTop: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), #65A30D)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                              {listing.seller_name.charAt(0)}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{listing.seller_name}</span>
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                            <Shield size={8} /> Verified
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          <Clock size={11} />
                          {timeAgo(listing.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="reveal" style={{ marginTop: '60px', textAlign: 'center' }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '40px', maxWidth: '560px', margin: '0 auto' }}>
              <Bike size={36} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Have a cycle to rent out?</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '24px' }}>
                Earn ₹50–₹150/day from your cycle sitting in the hostel. List it in 3 minutes.
              </p>
              <Link href="/post">
                <button className="btn-primary" style={{ padding: '12px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  List for Rent <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
