import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp-store'

const COLLEGE_DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_DOMAIN || 'thapar.edu'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string = (body.email || '').toLowerCase().trim()
    const token: string = (body.token || '').trim()

    // ── 1. Input validation ────────────────────────────────────────────────────
    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification code are required.' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(token)) {
      return NextResponse.json(
        { error: 'Verification code must be exactly 6 digits.' },
        { status: 400 }
      )
    }

    // ── 2. Domain guard (second layer) ─────────────────────────────────────────
    const domain = email.split('@')[1]
    if (domain !== COLLEGE_DOMAIN) {
      return NextResponse.json(
        { error: `Only @${COLLEGE_DOMAIN} emails are permitted.` },
        { status: 403 }
      )
    }

    // ── 3. Verify OTP against server-side store ────────────────────────────────
    const result = verifyOTP(email, token)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // ── 4. OTP verified — build user object ────────────────────────────────────
    const user = {
      id: `user-${Buffer.from(email).toString('base64url').slice(0, 12)}`,
      email,
      name: email
        .split('@')[0]
        .replace(/[._\-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      hostel: '',
      is_onboarded: false,
    }

    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error('[verify-otp] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
