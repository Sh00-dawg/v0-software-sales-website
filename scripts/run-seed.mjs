import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = readFileSync('./scripts/002_seed_data.sql', 'utf8')

// Split by semicolons and execute each statement
const statements = sql.split(';').filter(s => s.trim())

for (const stmt of statements) {
  if (stmt.trim()) {
    const { error } = await supabase.rpc('exec_sql', { sql_string: stmt })
    if (error) {
      console.log('Statement may need manual execution:', stmt.slice(0, 50) + '...')
    }
  }
}

console.log('Seed script completed')
