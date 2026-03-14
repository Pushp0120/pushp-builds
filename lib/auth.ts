import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function getAdminFromCookie() {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function isValidAdmin(username: string, password: string) {
  return (
    username === (process.env.ADMIN_USERNAME || 'admin') &&
    password === (process.env.ADMIN_PASSWORD || 'admin123')
  )
}
