import nodemailer, { type Transporter } from 'nodemailer'

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  if (!host) return null // SMTP disabled (local dev) — sends are logged instead

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  })
  return cachedTransporter
}

export interface SendEmailArgs {
  to: string
  subject: string
  body: string
  replyTo?: string
}

/**
 * Fire-and-forget email send with retry. Never throws — email delivery must
 * not block or fail a form submission or an admin action.
 */
export async function sendEmail({ to, subject, body, replyTo }: SendEmailArgs): Promise<void> {
  const from = process.env.SMTP_FROM || 'info@sparta-motors.com'
  const transporter = getTransporter()

  if (!transporter) {
    console.info(
      `[email:disabled] would send to=${to} replyTo=${replyTo ?? '-'}\nSubject: ${subject}\n\n${body}`,
    )
    return
  }

  const delays = [1000, 3000, 10000]
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      await transporter.sendMail({ from, to, subject, text: body, replyTo })
      console.info(`[email:sent] to=${to} subject="${subject}"`)
      return
    } catch (err) {
      if (attempt === delays.length) {
        console.error(`[email:failed] to=${to} subject="${subject}"`, err)
        return
      }
      await new Promise((r) => setTimeout(r, delays[attempt]))
    }
  }
}
