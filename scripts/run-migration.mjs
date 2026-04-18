import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = readFileSync('./scripts/001_create_tables.sql', 'utf8')

// Split by statements and run each
const statements = sql.split(/;(?=\s*(?:--|CREATE|ALTER|INSERT|DROP|$))/i)
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))

for (const stmt of statements) {
  if (stmt) {
    const { error } = await supabase.rpc('exec_sql', { sql_string: stmt + ';' }).catch(() => ({}))
    if (error) {
      console.log('Statement skipped (may need manual run):', stmt.substring(0, 50) + '...')
    }
  }
}

console.log('Migration script completed')
