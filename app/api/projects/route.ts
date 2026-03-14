import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, project_type, project_name, description, features, budget_range, timeline, reference_links } = body

    if (!name || !email || !project_type || !project_name || !description) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const sql = getDb()
    const result = await sql`
      INSERT INTO projects (name, email, phone, project_type, project_name, description, features, budget_range, timeline, reference_links)
      VALUES (${name}, ${email}, ${phone || ''}, ${project_type}, ${project_name}, ${description}, ${features || ''}, ${budget_range || ''}, ${timeline || ''}, ${reference_links || ''})
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
