'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bike, User, Building2, GraduationCap, Cpu, ChevronRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const HOSTELS = ['JGB', 'MGG', 'Kailash', 'Vishwakarma', 'P-Block', 'Q-Block', 'Girls Hostel', 'Other']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG', 'PhD']
const BRANCHES = [
  'Computer Science', 'Electronics & Communication', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Biotechnology', 'MBA', 'Other',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', hostel: '', year: '', branch: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = localStorage.getItem('pedalup_user')
    if (!stored) { router.replace('/login'); return }
    const user = JSON.parse(stored)
    if (user.is_onboarded) { router.replace('/'); return }
    if (user.name) setForm(f => ({ ...f, name: user.name }))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.hostel) e.hostel = 'Select your hostel'
    if (!form.year) e.year = 'Select your year'
    if (!form.branch) e.branch = 'Select your branch'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    const stored = JSON.parse(localStorage.getItem('pedalup_user') || '{}')
    const updated = { ...stored, ...form, is_onboarded: true }
    localStorage.setItem('pedalup_user', JSON.stringify(updated))
    window.dispatchEvent(new Event('pedalup-auth-change'))
    setLoading(false)
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="grid-overlay" style={{ position: 'fixed', inset: 0, opacity: 0.3 }} />
      <div style={{
        width: '100%', maxWidth: '520px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '28px' }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #22C55E, #16A34A)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
              <Bike size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Pedal<span style={{ color: 'var(--primary)' }}>Up</span></span>
          </Link>
          <div style={{
            width: 64, height: 64, borderRadius: '20px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <User size={30} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Set up your profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Just a few details so buyers & sellers can connect with you
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '32px' }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: '40px', borderColor: errors.name ? '#ef4444' : undefined }}
                placeholder="Your full name"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }) }}
              />
            </div>
            {errors.name && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
          </div>

          {/* Hostel */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Hostel / Residence
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', zIndex: 1 }} />
              <select
                className="input-field"
                style={{ paddingLeft: '40px', cursor: 'pointer', borderColor: errors.hostel ? '#ef4444' : undefined }}
                value={form.hostel}
                onChange={e => { setForm({ ...form, hostel: e.target.value }); setErrors({ ...errors, hostel: '' }) }}
              >
                <option value="">Select hostel</option>
                {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            {errors.hostel && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.hostel}</p>}
          </div>

          {/* Year & Branch */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Year
              </label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', zIndex: 1 }} />
                <select
                  className="input-field"
                  style={{ paddingLeft: '40px', cursor: 'pointer', borderColor: errors.year ? '#ef4444' : undefined }}
                  value={form.year}
                  onChange={e => { setForm({ ...form, year: e.target.value }); setErrors({ ...errors, year: '' }) }}
                >
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {errors.year && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Branch
              </label>
              <div style={{ position: 'relative' }}>
                <Cpu size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', zIndex: 1 }} />
                <select
                  className="input-field"
                  style={{ paddingLeft: '40px', cursor: 'pointer', borderColor: errors.branch ? '#ef4444' : undefined }}
                  value={form.branch}
                  onChange={e => { setForm({ ...form, branch: e.target.value }); setErrors({ ...errors, branch: '' }) }}
                >
                  <option value="">Branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {errors.branch && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.branch}</p>}
            </div>
          </div>

          <button
            id="complete-profile-btn"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Setting up...</>
            ) : (
              <>Complete Profile <ChevronRight size={16} /></>
            )}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px', marginTop: '20px' }}>
          By signing up, you agree to our{' '}
          <span style={{ color: 'var(--primary)' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: 'var(--primary)' }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
