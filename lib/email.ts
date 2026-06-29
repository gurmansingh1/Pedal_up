/**
 * Email sending service for PedalUp.
 * Uses nodemailer with SMTP credentials from environment variables.
 * Falls back to console logging in development when SMTP is not configured.
 */

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || `"PedalUp" <${SMTP_USER}>`

/** True when all required SMTP env vars are present */
export const isEmailConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS)

/**
 * Send a verification OTP email.
 * In development (SMTP unconfigured) the OTP is logged to the server console.
 */
export async function sendOTPEmail(
  to: string,
  otp: string
): Promise<void> {
  if (!isEmailConfigured) {
    // ── Dev mode ─────────────────────────────────────────────────────────────
    const border = '─'.repeat(52)
    console.log(`\n${border}`)
    console.log(`  🚲  PedalUp — Verification Code (DEV MODE)`)
    console.log(border)
    console.log(`  📧  Email : ${to}`)
    console.log(`  🔑  OTP   : ${otp}`)
    console.log(`  ⏰  Expires in 10 minutes`)
    console.log(`${border}\n`)
    return
  }

  // ── Real email via nodemailer ───────────────────────────────────────────────
  const nodemailer = (await import('nodemailer')).default

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#1E293B;border-radius:20px;overflow:hidden;border:1px solid rgba(34,197,94,0.15);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d1f0d,#0F172A);padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(34,197,94,0.12);">
            <div style="display:inline-block;background:linear-gradient(135deg,#22C55E,#16A34A);border-radius:14px;padding:12px 24px;margin-bottom:16px;">
              <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">🚲 PedalUp</span>
            </div>
            <p style="color:#94A3B8;font-size:13px;margin:0;letter-spacing:0.3px;">TIET Campus Cycle Marketplace</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h1 style="color:#F8FAFC;font-size:22px;font-weight:700;margin:0 0 10px;letter-spacing:-0.5px;">
              Your verification code
            </h1>
            <p style="color:#94A3B8;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Enter this code to sign in to PedalUp.
              It expires in <strong style="color:#F8FAFC;">10 minutes</strong> and can only be used once.
            </p>
            <!-- OTP box -->
            <div style="background:#0F172A;border:1.5px solid rgba(34,197,94,0.35);border-radius:14px;padding:30px;text-align:center;margin-bottom:28px;">
              <span style="font-size:52px;font-weight:900;letter-spacing:16px;color:#22C55E;font-family:'Courier New',monospace;">
                ${otp}
              </span>
            </div>
            <div style="background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.12);border-radius:10px;padding:14px 18px;">
              <p style="color:#64748B;font-size:12px;margin:0;line-height:1.6;">
                🔒 <strong style="color:#94A3B8;">Security notice:</strong> PedalUp will never ask for your OTP via phone, email, or chat. Do not share this code with anyone.
              </p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid #334155;">
            <p style="color:#475569;font-size:11px;text-align:center;margin:0;line-height:1.6;">
              This code was requested for <strong>${to}</strong>.<br>
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: `${otp} — Your PedalUp verification code`,
    html,
    text: `Your PedalUp verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
  })
}
