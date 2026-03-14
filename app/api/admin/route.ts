import { NextRequest, NextResponse } from 'next/server'
import { isValidAdmin, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!isValidAdmin(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken({ username, role: 'admin' })
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_token')
  return res
}
