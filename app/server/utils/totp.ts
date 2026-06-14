import { createHmac } from 'crypto'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function normalizeBase32(secret: string) {
  return secret
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, '')
}

export function generateBase32Secret(length = 16) {
  const bytes = Buffer.from(Array.from({ length }, () => Math.floor(Math.random() * 256)))
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

export function base32ToBytes(base32: string) {
  const normalized = normalizeBase32(base32)
  if (!normalized.length || normalized.length % 8 === 1) {
    throw new Error('Invalid base32 secret')
  }

  const bytes = []
  let bits = 0
  let value = 0

  for (const char of normalized) {
    const index = ALPHABET.indexOf(char)
    if (index === -1) {
      throw new Error('Invalid base32 secret')
    }

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Uint8Array.from(bytes)
}

export function generateTOTP(secret: string, digits = 6, period = 30, timestamp = Date.now()) {
  const key = base32ToBytes(secret)
  const counter = Math.floor(timestamp / 1000 / period)

  const counterBuffer = Buffer.alloc(8)
  counterBuffer.writeBigUInt64BE(BigInt(counter), 0)

  const hmac = createHmac('sha1', key)
  hmac.update(counterBuffer)
  const hash = hmac.digest()

  const offset = hash[hash.length - 1] & 0x0f
  const code = ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const result = (code % 10 ** digits).toString().padStart(digits, '0')
  return result
}

export function verifyTOTP(secret: string, token: string, window = 2, digits = 6, period = 30) {
  const normalizedToken = token.toString().trim()
  for (let errorWindow = -window; errorWindow <= window; errorWindow += 1) {
    const timestamp = Date.now() + errorWindow * period * 1000
    const candidate = generateTOTP(secret, digits, period, timestamp)
    if (candidate === normalizedToken) {
      return true
    }
  }
  return false
}
