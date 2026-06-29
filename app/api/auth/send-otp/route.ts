import { NextRequest, NextResponse } from 'next/server'
import { createOTP, clearOTP } from '@/lib/otp-store'
import { sendOTPEmail, isEmailConfigured } from '@/lib/email'

const COLLEGE_DOMAIN = process.env.NEXT_PUBLIC_COLLEGE_DOMAIN || 'thapar.edu'
const IS_DEV = process.env.NODE_ENV !== 'production'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string = (body.email || '').toLowerCase().trim()

    // ── 1. Format validation ───────────────────────────────────────────────────
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // ── 2. @thapar.edu domain enforcement (server-side, cannot be bypassed) ───
    const domain = email.split('@')[1]
    if (domain !== COLLEGE_DOMAIN) {
      return NextResponse.json(
        {
          error: `Only @${COLLEGE_DOMAIN} email addresses are allowed. You entered a @${domain} address — please use your Thapar Institute email.`,
        },
        { status: 403 }
      )
    }

    // ── 3. Generate real OTP, clear any existing one first ────────────────────
    clearOTP(email)               // invalidate previous OTP if any
    const otp = createOTP(email)  // cryptographically secure 6-digit code

    // ── 4. Send via email (or log to console in dev) ──────────────────────────
    try {
      await sendOTPEmail(email, otp)
    } catch (emailErr) {
      console.error('[send-otp] Email send failed:', emailErr)
      // Don't expose internal errors; clear the OTP so a retry works
      clearOTP(email)
      return NextResponse.json(
        {
          error:
            'Failed to send verification email. Please check SMTP settings or try again.',
        },
        { status: 500 }
      )
    }

    // ── 5. Respond ─────────────────────────────────────────────────────────────
    const response: Record<string, unknown> = { success: true }

    if (!isEmailConfigured) {
      // Dev mode: tell the client SMTP is not set up
      response.mock = true
      if (IS_DEV) {
        // Expose OTP in response ONLY in development so the UI can display it
        response.devOtp = otp
        response.devNote =
          'SMTP not configured — OTP shown here for development only. Set SMTP_* env vars for real email.'
      }
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('[send-otp] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
