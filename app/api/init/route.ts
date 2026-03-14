import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

// Call this once after deployment: GET /api/init
export async function GET() {
  try {
    await initDb()
    return NextResponse.json({ success: true, message: 'Database initialized!' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
