/**
 * Server-side OTP store with TTL.
 * Uses a global Map so OTPs survive Next.js hot-reloads in development.
 * In production the Map lives for the process lifetime (suitable for a
 * single-instance deployment; swap for Redis/DB for multi-instance).
 */

declare global {
  // eslint-disable-next-line no-var
  var __pedalup_otp_store: Map<string, OTPRecord> | undefined
}

interface OTPRecord {
  otp: string
  expiresAt: number
  attempts: number
}

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5

// Survive Next.js hot-module-replacement by attaching to global
const store: Map<string, OTPRecord> =
  global.__pedalup_otp_store ??
  (global.__pedalup_otp_store = new Map<string, OTPRecord>())

/** Generate a cryptographically secure 6-digit OTP */
function generateSecure6Digit(): string {
  // Uniform distribution over [100000, 999999]
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return String(100000 + (arr[0] % 900000))
}

/** Create an OTP for the given email and return the code. */
export function createOTP(email: string): string {
  const otp = generateSecure6Digit()
  store.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  })
  return otp
}

/** Verify the OTP for the given email. Returns {valid, error?}. */
export function verifyOTP(
  email: string,
  inputOtp: string
): { valid: boolean; error?: string } {
  const key = email.toLowerCase()
  const record = store.get(key)

  if (!record) {
    return {
      valid: false,
      error: 'No verification code found for this email. Please request a new one.',
    }
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key)
    return {
      valid: false,
      error: 'Verification code has expired. Please request a new one.',
    }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key)
    return {
      valid: false,
      error: 'Too many incorrect attempts. Please request a new verification code.',
    }
  }

  if (record.otp !== inputOtp.trim()) {
    record.attempts += 1
    const remaining = MAX_ATTEMPTS - record.attempts
    if (remaining <= 0) {
      store.delete(key)
      return {
        valid: false,
        error: 'Too many incorrect attempts. Please request a new verification code.',
      }
    }
    return {
      valid: false,
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    }
  }

  // ✅ Valid — delete immediately (single-use)
  store.delete(key)
  return { valid: true }
}

/** Delete any stored OTP for this email (e.g., on resend). */
export function clearOTP(email: string): void {
  store.delete(email.toLowerCase())
}
