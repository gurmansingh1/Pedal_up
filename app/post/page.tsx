'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload, Image as ImageIcon, X, Plus, Bike, IndianRupee,
  MapPin, CheckCircle, LogIn, ShoppingCart, Calendar, Shield,
  Clock, ChevronDown,
} from 'lucide-react'

const CYCLE_TYPES = ['Hybrid', 'Mountain', 'Road', 'City', 'Folding', 'BMX', 'Electric', 'Other']
const CONDITIONS = [
  { value: 'like_new', label: 'Like New', desc: 'Barely used, no scratches' },
  { value: 'good',     label: 'Good',     desc: 'Minor signs of use' },
  { value: 'fair',     label: 'Fair',     desc: 'Noticeable wear, works fine' },
  { value: 'poor',     label: 'Poor',     desc: 'Heavy wear, needs repairs' },
]

type ListingMode = 'sale' | 'rent'

interface FormState {
  title: string
  brand: string
  cycle_type: string
  condition: string
  age_months: string
  pickup_location: string
  description: string
  // Sale fields
  price: string
  // Rent fields
  rent_per_day: string
  rent_per_week: string
  rent_per_month: string
  security_deposit: string
  min_rental_days: string
}

export default function PostPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [mode, setMode] = useState<ListingMode>('sale')
  const [images, setImages] = useState<{ file: File; url: string }[]>([])
  const [form, setForm] = useState<FormState>({
    title: '', brand: '', cycle_type: '', condition: '',
    age_months: '', pickup_location: '', description: '',
    price: '',
    rent_per_day: '', rent_per_week: '', rent_per_month: '',
    security_deposit: '', min_rental_days: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('pedalup_user')
    if (!stored) { router.push('/login?redirect=/post'); return }
    setUser(JSON.parse(stored))
  }, [router])

  const handleImageAdd = (files: FileList | null) => {
    if (!files) return
    const newImages: { file: File; url: string }[] = []
    for (const file of Array.from(files)) {
      if (images.length + newImages.length >= 5) break
      if (!file.type.startsWith('image/')) continue
      newImages.push({ file, url: URL.createObjectURL(file) })
    }
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(images[i].url)
    setImages(prev => prev.filter((_, idx) => idx !== i))
  }

  const setField = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.cycle_type)   e.cycle_type = 'Select cycle type'
    if (!form.condition)    e.condition = 'Select condition'
    if (!form.pickup_location.trim()) e.pickup_location = 'Pickup location is required'
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters'

    if (mode === 'sale') {
      const p = Number(form.price)
      if (!form.price || isNaN(p) || p < 100) e.price = 'Enter a valid asking price (min ₹100)'
    }

    if (mode === 'rent') {
      const d = Number(form.rent_per_day)
      if (!form.rent_per_day || isNaN(d) || d < 10)
        e.rent_per_day = 'Enter a valid daily rate (min ₹10/day)'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1600))
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', paddingTop: '80px' }}>
        <LogIn size={40} color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to post a listing</p>
        <Link href="/login"><button className="btn-primary">Sign In</button></Link>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', paddingTop: '80px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '24px',
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CheckCircle size={42} color="#22c55e" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            {mode === 'rent' ? 'Rental Listing Posted!' : 'Listing Posted!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#E7E5E4', padding: '88px 24px 80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Bike size={22} color="var(--primary)" />
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', color: '#1F2937', fontFamily: 'Inter, sans-serif' }}>Post a Listing</h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
            List your cycle for sale or rent — reach hundreds of TIET students instantly
          </p>
        </div>

        {/* ── Mode Toggle ─────────────────────────────────────────────────────── */}
        <div style={{
          marginBottom: '28px',
          background: '#F8F7F4',
          border: '1px solid #E5E2DF',
          borderRadius: '12px',
          padding: '6px',
          display: 'inline-flex',
          gap: '4px',
        }}>
          {[
            { key: 'sale', label: 'For Sale', icon: ShoppingCart },
            { key: 'rent', label: 'For Rent', icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key as ListingMode)}
              style={{
                padding: '10px 28px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                ...(mode === key
                  ? {
                      background: '#1F2937',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(31,41,55,0.2)',
                    }
                  : {
                      background: 'transparent',
                      color: '#6B7280',
                    }),
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <div style={{
          marginBottom: '28px', padding: '14px 18px',
          background: mode === 'sale' ? 'rgba(34,197,94,0.05)' : 'rgba(132,204,22,0.05)',
          border: `1px solid ${mode === 'sale' ? 'rgba(34,197,94,0.15)' : 'rgba(132,204,22,0.15)'}`,
          borderRadius: '12px',
          fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          {mode === 'sale'
            ? '💰 You\'re listing this cycle for sale. Set a fixed asking price. Once sold, the listing will be automatically removed.'
            : '🔑 You\'re listing this cycle for rent. Set your daily rate and optionally weekly/monthly rates and a security deposit.'
          }
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Photos */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={16} color="var(--primary)" />
              Photos
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '13px' }}>({images.length}/5)</span>
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 100, height: 80 }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border-default)' }} />
                  <button onClick={() => removeImage(i)} style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#ef4444', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <X size={10} color="#fff" />
                  </button>
                  {i === 0 && (
                    <div style={{
                      position: 'absolute', bottom: 4, left: 4,
                      background: 'rgba(0,0,0,0.7)', borderRadius: '4px',
                      padding: '1px 5px', fontSize: '9px', color: 'var(--primary)', fontWeight: 700,
                    }}>COVER</div>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <button onClick={() => fileRef.current?.click()} style={{
                  width: 100, height: 80,
                  background: 'var(--bg-subtle)',
                  border: '2px dashed var(--border-light)',
                  borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '4px', color: 'var(--text-tertiary)', transition: 'all 0.2s ease',
                }}>
                  <Plus size={20} />
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>Add Photo</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => handleImageAdd(e.target.files)} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '12px' }}>
              First image becomes the cover. Max 5 photos.
            </p>
          </div>

          {/* Cycle Details */}
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Cycle Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Title *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Firefox Target 21-Speed Hybrid"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  style={{ borderColor: errors.title ? '#ef4444' : undefined }}
                />
                {errors.title && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.title}</p>}
              </div>

              {/* Brand + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Brand</label>
                  <input className="input-field" placeholder="e.g. Firefox, Hero, Atlas" value={form.brand} onChange={e => setField('brand', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Cycle Type *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="input-field"
                      style={{ cursor: 'pointer', borderColor: errors.cycle_type ? '#ef4444' : undefined, appearance: 'none' }}
                      value={form.cycle_type}
                      onChange={e => setField('cycle_type', e.target.value)}
                    >
                      <option value="">Select type</option>
                      {CYCLE_TYPES.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                  </div>
                  {errors.cycle_type && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.cycle_type}</p>}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>Condition *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setField('condition', c.value)}
                      style={{
                        padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                        background: form.condition === c.value ? 'rgba(34,197,94,0.08)' : 'var(--bg-subtle)',
                        border: `1.5px solid ${form.condition === c.value ? 'rgba(34,197,94,0.5)' : errors.condition ? '#ef4444' : 'var(--border-default)'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: form.condition === c.value ? 'var(--primary)' : 'var(--text-primary)' }}>{c.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{c.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.condition && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.condition}</p>}
              </div>

              {/* Age + Pickup */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Age (months)</label>
                  <input className="input-field" type="number" placeholder="12" value={form.age_months} onChange={e => setField('age_months', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Pickup Location *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      className="input-field" style={{ paddingLeft: '38px', borderColor: errors.pickup_location ? '#ef4444' : undefined }}
                      placeholder="e.g. JGB Hostel Parking" value={form.pickup_location}
                      onChange={e => setField('pickup_location', e.target.value)}
                    />
                  </div>
                  {errors.pickup_location && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.pickup_location}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Description *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder={mode === 'rent'
                    ? 'Describe your cycle — condition details, what\'s included, rental rules, return process...'
                    : 'Describe your cycle — gear count, recent service, accessories included, reason for selling...'
                  }
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  style={{ resize: 'vertical', borderColor: errors.description ? '#ef4444' : undefined }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  {errors.description ? <p style={{ color: '#ef4444', fontSize: '12px' }}>{errors.description}</p> : <span />}
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{form.description.length}/500</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SALE Pricing ──────────────────────────────────────────────────── */}
          {mode === 'sale' && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={16} color="var(--primary)" />
                Sale Price
              </h2>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>Asking Price (₹) *</label>
                <div style={{ position: 'relative' }}>
                  <IndianRupee size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    className="input-field" style={{ paddingLeft: '38px', borderColor: errors.price ? '#ef4444' : undefined }}
                    type="number" placeholder="5000" value={form.price}
                    onChange={e => setField('price', e.target.value)}
                  />
                </div>
                {errors.price && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.price}</p>}
                <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '8px' }}>
                  Tip: Check similar listings to set a competitive price.
                </p>
              </div>
            </div>
          )}

          {/* ── RENT Pricing ──────────────────────────────────────────────────── */}
          {mode === 'rent' && (
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--accent)" />
                Rental Pricing
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Per day (required) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                    Rent per Day (₹) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <IndianRupee size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                      className="input-field" style={{ paddingLeft: '38px', borderColor: errors.rent_per_day ? '#ef4444' : undefined }}
                      type="number" placeholder="60" value={form.rent_per_day}
                      onChange={e => setField('rent_per_day', e.target.value)}
                    />
                  </div>
                  {errors.rent_per_day && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.rent_per_day}</p>}
                </div>

                {/* Per week + Per month */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                      Rent per Week (₹)
                      <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input className="input-field" style={{ paddingLeft: '38px' }} type="number" placeholder="350"
                        value={form.rent_per_week} onChange={e => setField('rent_per_week', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                      Rent per Month (₹)
                      <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IndianRupee size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input className="input-field" style={{ paddingLeft: '38px' }} type="number" placeholder="1100"
                        value={form.rent_per_month} onChange={e => setField('rent_per_month', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Deposit + Min days */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                      Security Deposit (₹)
                      <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Shield size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input className="input-field" style={{ paddingLeft: '38px' }} type="number" placeholder="500"
                        value={form.security_deposit} onChange={e => setField('security_deposit', e.target.value)} />
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px' }}>Refunded on return</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                      Minimum Rental
                      <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '4px' }}>optional</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                      <input className="input-field" style={{ paddingLeft: '38px' }} type="number" placeholder="1"
                        value={form.min_rental_days} onChange={e => setField('min_rental_days', e.target.value)} />
                    </div>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '4px' }}>Minimum days</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            id="submit-listing-btn"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%', padding: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {submitting
              ? <><div className="spinner" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} /> Publishing...</>
              : <><Bike size={18} /> {mode === 'rent' ? 'Publish Rental Listing' : 'Publish Sale Listing'}</>
            }
          </button>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
            Your listing appears on PedalUp immediately after submission
          </p>
        </div>
      </div>
    </div>
  )
}
