import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function main() {
  const res = await pool.query(`SELECT id, email, active, pg_typeof(active) FROM "User" WHERE email = 'admin@kova.test'`)
  console.log(JSON.stringify(res.rows, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => pool.end())
