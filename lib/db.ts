import { neon } from '@neondatabase/serverless'

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return neon(process.env.DATABASE_URL)
}

// Initialize database tables (run once)
export async function initDb() {
  const sql = getDb()
  
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      project_type VARCHAR(50) NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      features TEXT,
      budget_range VARCHAR(100),
      timeline VARCHAR(100),
      reference_links TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      admin_notes TEXT,
      quoted_price DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  return { success: true }
}
