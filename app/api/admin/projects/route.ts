import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getAdminFromCookie } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!getAdminFromCookie()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const sql = getDb()
  const projects = status
    ? await sql`SELECT * FROM projects WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM projects ORDER BY created_at DESC`

  return NextResponse.json(projects)
}

export async function PATCH(req: NextRequest) {
  if (!getAdminFromCookie()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, admin_notes, quoted_price } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const sql = getDb()
  await sql`
    UPDATE projects
    SET status = ${status}, admin_notes = ${admin_notes || ''}, quoted_price = ${quoted_price || null}, updated_at = NOW()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}
