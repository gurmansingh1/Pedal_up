'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bike, Mail, ArrowRight, ShieldCheck, Loader2,
  CheckCircle, XCircle, ChevronLeft, Lock, Zap, Users, Terminal,
} from 'lucide-react'

const COLLEGE_DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_DOMAIN || 'thapar.edu'

type Step = 'email' | 'otp' | 'success'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [devOtp, setDevOtp] = useState('')   // shown only in dev when SMTP unconfigured
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pedalup_user')) {
      router.replace('/')
    }
  }, [router])

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  /* ── Client-side domain validation (fast UX) ─────────────────────────────── */
  const validateEmailFrontend = (e: string): string => {
    if (!e) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address'
    const domain = e.split('@')[1]?.toLowerCase()
    if (domain !== COLLEGE_DOMAIN) {
      return `Only @${COLLEGE_DOMAIN} addresses are allowed. "@${domain}" is not accepted.`
    }
    return ''
  }

  /* ── Send OTP ─────────────────────────────────────────────────────────────── */
  const handleSendOTP = async () => {
    const frontendErr = validateEmailFrontend(email.trim())
    if (frontendErr) { setError(frontendErr); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send code. Please try again.')
        setLoading(false)
        return
      }

      // Dev mode: surface OTP in the UI
      if (data.devOtp) setDevOtp(data.devOtp)

      setLoading(false)
      setStep('otp')
      setResendTimer(60)
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch {
      setError('Network error. Check your connection and try again.')
      setLoading(false)
    }
  }

  /* ── OTP input helpers ────────────────────────────────────────────────────── */
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') handleVerifyOTP()
  }

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  /* ── Verify OTP ───────────────────────────────────────────────────────────── */
  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Enter the complete 6-digit code'); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), token: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        setError(data.error || 'Incorrect code. Please try again.')
        return
      }

      const user = data.user
      localStorage.setItem('pedalup_user', JSON.stringify(user))
      localStorage.setItem('pedalup_session', JSON.stringify({ user_id: user.id }))
      window.dispatchEvent(new Event('pedalup-auth-change'))

      setLoading(false)
      setDevOtp('')
      setStep('success')
      setTimeout(() => {
        if (user.is_onboarded) router.push('/')
        else router.push('/onboarding')
      }, 1600)
    } catch {
      setError('Network error. Check your connection and try again.')
      setLoading(false)
    }
  }

  /* ── Resend ───────────────────────────────────────────────────────────────── */
  const handleResend = async () => {
    if (resendTimer > 0) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setDevOtp('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to resend.')
      } else {
        if (data.devOtp) setDevOtp(data.devOtp)
        setResendTimer(60)
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const features = [
    { icon: ShieldCheck, text: `Only @${COLLEGE_DOMAIN} verified members` },
    { icon: Bike,        text: 'Browse 120+ listed cycles on campus' },
    { icon: Zap,         text: 'Instant messaging with sellers' },
    { icon: Users,       text: '2,400+ TIET students already on PedalUp' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(132,204,22,0.04) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />
      <div className="grid-overlay" style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.4 }} />

      {/* ── Left branding panel ─────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 64px',
          position: 'relative',
          zIndex: 1,
        }}
        className="login-left"
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '60px' }}>
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            borderRadius: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
          }}>
            <Bike size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Pedal<span style={{ color: 'var(--primary)' }}>Up</span>
          </span>
        </Link>

        <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '20px' }}>
          Your campus.<br />
          <span className="gradient-text">Your cycles.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.75, maxWidth: '380px', marginBottom: '48px' }}>
          Join Thapar Institute students in the safest, most convenient campus cycle marketplace.
        </p>

        {features.map((feat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <feat.icon size={16} color="var(--primary)" />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{feat.text}</span>
          </div>
        ))}

        <div style={{ marginTop: '64px' }}>
          <div style={{
            width: 180, height: 180,
            background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'float 5s ease-in-out infinite',
          }}>
            <Bike size={72} color="rgba(34,197,94,0.2)" strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────────── */}
      <div
        style={{
          width: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          position: 'relative',
          zIndex: 1,
          borderLeft: '1px solid var(--border-light)',
          background: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(24px)',
        }}
        className="login-right"
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* ── Email Step ─────────────────────────────────────────────────── */}
          {step === 'email' && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>
                  Sign in
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  Enter your Thapar Institute email. A one-time verification code will be sent to it.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  College Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    id="email-input"
                    className="input-field"
                    style={{ paddingLeft: '42px', borderColor: error ? '#ef4444' : undefined }}
                    type="email"
                    placeholder={`yourname@${COLLEGE_DOMAIN}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                {error && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '10px', color: '#ef4444', fontSize: '13px', lineHeight: 1.5 }}>
                    <XCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {error}
                  </div>
                )}
              </div>

              <button
                id="send-otp-btn"
                className="btn-primary"
                onClick={handleSendOTP}
                disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} /> Sending code...</>
                  : <>Send Verification Code <ArrowRight size={16} /></>
                }
              </button>

              <div style={{
                marginTop: '20px', padding: '14px 16px',
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Lock size={13} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Access restricted to{' '}
                    <strong style={{ color: 'var(--primary)' }}>@{COLLEGE_DOMAIN}</strong>{' '}
                    addresses only. Gmail, Yahoo, or other domains are not accepted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── OTP Step ───────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <div className="animate-fade-in-up">
              <button
                onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); setDevOtp('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '28px',
                  padding: 0, fontFamily: 'Inter, sans-serif',
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  width: 56, height: 56,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <Mail size={26} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
                  Check your inbox
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {devOtp
                    ? 'Running in dev mode — SMTP not configured.'
                    : <>We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></>
                  }
                </p>
              </div>

              {/* Dev mode OTP banner */}
              {devOtp && (
                <div style={{
                  marginBottom: '20px', padding: '14px 18px',
                  background: 'rgba(234,179,8,0.08)',
                  border: '1px solid rgba(234,179,8,0.3)',
                  borderRadius: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Terminal size={14} color="#eab308" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Development Mode
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px', lineHeight: 1.5 }}>
                    SMTP not configured. Add <code style={{ color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '4px' }}>SMTP_*</code> vars to <code style={{ color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: '4px' }}>.env.local</code> for real emails.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Your OTP:</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '6px', color: '#eab308', fontFamily: 'monospace' }}>
                      {devOtp}
                    </span>
                  </div>
                </div>
              )}

              {/* OTP grid */}
              <div
                style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}
                onPaste={handleOTPPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    style={{ borderColor: digit ? 'var(--primary)' : error ? '#ef4444' : undefined }}
                  />
                ))}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', color: '#ef4444', fontSize: '13px', justifyContent: 'center' }}>
                  <XCircle size={13} />
                  {error}
                </div>
              )}

              <button
                id="verify-otp-btn"
                className="btn-primary"
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
              >
                {loading
                  ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} /> Verifying...</>
                  : <>Verify &amp; Sign In <ShieldCheck size={16} /></>
                }
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  style={{
                    background: 'none', border: 'none', fontFamily: 'Inter, sans-serif',
                    cursor: resendTimer > 0 ? 'default' : 'pointer',
                    color: resendTimer > 0 ? 'var(--text-tertiary)' : 'var(--primary)',
                    fontWeight: 600, fontSize: '13px', padding: 0,
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                </button>
              </p>
            </div>
          )}

          {/* ── Success Step ───────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="animate-scale-in" style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                animation: 'glow-pulse 1.5s ease-in-out infinite',
              }}>
                <CheckCircle size={40} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>
                Welcome to PedalUp!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Identity verified. Setting up your profile...
              </p>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-right {
            width: 100% !important;
            border-left: none !important;
            padding: 40px 24px !important;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.2); }
          50%       { box-shadow: 0 0 40px rgba(34,197,94,0.5), 0 0 80px rgba(34,197,94,0.15); }
        }
      `}</style>
    </div>
  )
}
