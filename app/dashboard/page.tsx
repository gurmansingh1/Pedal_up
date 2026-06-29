'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bike, LayoutDashboard, Package, Heart, TrendingUp, Edit3, Trash2, CheckCircle, AlertCircle, Eye, Plus, LogIn, Calendar, ShoppingCart } from 'lucide-react'

const MOCK_MY_LISTINGS = [
  {
    id: 'listing-uuid-1',
    title: 'Firefox Target 21-Speed Hybrid',
    price: 8500,
    condition: 'like_new',
    cycle_type: 'hybrid',
    listing_mode: 'sale',
    status: 'active',
    views: 42,
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80',
    created_at: '2026-06-23T12:00:00.000Z',
  },
  {
    id: 'listing-uuid-3',
    title: 'Btwin Triban RC100 Road Bike',
    price: 14000,
    condition: 'good',
    cycle_type: 'road',
    listing_mode: 'sale',
    status: 'sold',
    views: 87,
    image_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=400&q=80',
    created_at: '2026-06-23T14:00:00.000Z',
  },
  {
    id: 'rental-uuid-my-1',
    title: 'Hero Sprint City Cycle — Rental',
    rent_per_day: 60,
    price: 0,
    condition: 'good',
    cycle_type: 'city',
    listing_mode: 'rent',
    status: 'active',
    views: 18,
    image_url: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=400&q=80',
    created_at: '2026-06-25T10:00:00.000Z',
  },
]

const MOCK_SAVED = [
  {
    id: 'listing-uuid-2',
    title: 'Atlas Asteroid Mountain Bike',
    price: 4200,
    condition: 'good',
    cycle_type: 'mountain',
    image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'listing-uuid-5',
    title: 'Avon Cyclone Folding Bicycle',
    price: 6500,
    condition: 'like_new',
    cycle_type: 'folding',
    image_url: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=400&q=80',
  },
]

const CONDITION_COLORS: Record<string, string> = {
  like_new: '#22c55e',
  good:     '#84cc16',
  fair:     '#eab308',
  poor:     '#ef4444',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'saved'>('listings')
  const [listings, setListings] = useState(MOCK_MY_LISTINGS)

  useEffect(() => {
    const stored = localStorage.getItem('pedalup_user')
    if (!stored) { router.push('/login?redirect=/dashboard'); return }
    setUser(JSON.parse(stored))
  }, [])

  const markSold = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'sold' } : l))
  }

  const markRented = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rented' } : l))
  }

  const markAvailable = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'active' } : l))
  }

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id))
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <LogIn size={40} color="var(--accent)" />
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to access your dashboard</p>
        <Link href="/login"><button className="btn-primary">Sign In</button></Link>
      </div>
    )
  }

  const activeListings = listings.filter(l => l.status === 'active').length
  const soldListings = listings.filter(l => l.status === 'sold').length
  const totalRevenue = listings.filter(l => l.status === 'sold').reduce((s, l) => s + l.price, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#E7E5E4', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <LayoutDashboard size={22} color="var(--accent)" />
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>My Listings</h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
              Welcome back, <strong style={{ color: '#1F2937' }}>{user.name}</strong> · {user.hostel}
            </p>
          </div>
          <Link href="/post">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> New Listing
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Active Listings', value: activeListings, icon: Package,    color: '#2F855A' },
            { label: 'Cycles Sold',     value: soldListings,   icon: CheckCircle, color: '#276749' },
            { label: 'Total Earned',    value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#1F2937' },
            { label: 'Saved Listings',  value: MOCK_SAVED.length, icon: Heart,   color: '#6B7280' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '20px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: `${stat.color}18`, border: `1px solid ${stat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', padding: '4px',
          background: '#F8F7F4', borderRadius: '10px',
          border: '1px solid #E5E2DF',
          width: 'fit-content', marginBottom: '28px',
        }}>
          {(['listings', 'saved'] as const).map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'listings' ? 'My Listings' : 'Saved'}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {listings.length === 0 ? (
              <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                <Package size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 600 }}>No listings yet</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '4px' }}>List your first cycle to get started</p>
                <Link href="/post" style={{ display: 'inline-block', marginTop: '20px' }}>
                  <button className="btn-primary">Post Listing</button>
                </Link>
              </div>
            ) : listings.map(listing => (
              <div key={listing.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                <img
                  src={listing.image_url}
                  alt={listing.title}
                  style={{ width: 80, height: 70, objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Inter, sans-serif' }}>
                      {listing.title}
                    </h3>
                    {/* Listing mode badge */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                      ...(listing.listing_mode === 'rent'
                        ? { background: 'rgba(47,133,90,0.08)', color: '#2F855A', border: '1px solid rgba(47,133,90,0.2)' }
                        : { background: 'rgba(31,41,55,0.08)', color: '#1F2937', border: '1px solid rgba(31,41,55,0.15)' }),
                    }}>
                      {listing.listing_mode === 'rent' ? <Calendar size={9} /> : <ShoppingCart size={9} />}
                      {listing.listing_mode === 'rent' ? 'RENT' : 'SALE'}
                    </span>
                    <span className={`badge ${
                      listing.status === 'active' ? 'badge-green'
                      : listing.status === 'rented' ? 'badge-yellow'
                      : 'badge-red'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>
                      {listing.listing_mode === 'rent'
                        ? `₹${(listing as any).rent_per_day}/day`
                        : `₹${listing.price.toLocaleString('en-IN')}`
                      }
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                      <Eye size={12} /> {listing.views} views
                    </span>
                    <span style={{ fontSize: '12px', color: CONDITION_COLORS[listing.condition], fontWeight: 600 }}>
                      {listing.condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  {listing.status === 'active' && (
                    listing.listing_mode === 'rent' ? (
                      <button
                        onClick={() => markRented(listing.id)}
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '12px' }}
                      >
                        <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        Mark Rented
                      </button>
                    ) : (
                      <button
                        onClick={() => markSold(listing.id)}
                        className="btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '12px' }}
                      >
                        <CheckCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        Mark Sold
                      </button>
                    )
                  )}
                  {listing.status === 'rented' && (
                    <button
                      onClick={() => markAvailable(listing.id)}
                      className="btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '12px' }}
                    >
                      <CheckCircle size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      Mark Available
                    </button>
                  )}
                  <button
                    onClick={() => deleteListing(listing.id)}
                    style={{
                      padding: '7px 10px', background: 'rgba(185,60,60,0.08)',
                      border: '1px solid rgba(185,60,60,0.15)', borderRadius: '8px',
                      cursor: 'pointer', color: '#9B2626',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved tab */}
        {activeTab === 'saved' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {MOCK_SAVED.map(item => (
              <Link key={item.id} href={`/listing/${item.id}`} style={{ textDecoration: 'none' }}>
                <div className="listing-card">
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '6px', fontFamily: 'Inter, sans-serif' }}>{item.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="badge badge-accent">{item.cycle_type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
