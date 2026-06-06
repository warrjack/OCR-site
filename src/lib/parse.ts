const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
const PHONE_RE =
  /(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/

export interface ParsedContact {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export function parseOcrText(raw: string): ParsedContact {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const emailMatch = raw.match(EMAIL_RE)
  const email = emailMatch ? emailMatch[0] : ''

  const phoneMatch = raw.match(PHONE_RE)
  const phone = phoneMatch ? phoneMatch[0].trim() : ''

  // Find name: first short line with no digits and no @ symbol
  const nameLine =
    lines.find(
      (l) =>
        l.length < 40 &&
        !/\d/.test(l) &&
        !l.includes('@') &&
        l.split(' ').length >= 1,
    ) ?? ''

  const parts = nameLine.split(/\s+/).filter(Boolean)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')

  return { firstName, lastName, phone, email }
}
