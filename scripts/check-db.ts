import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')
const rows = await sql`SELECT id, name, slug, kind, system FROM data_tables`
console.log('DATA TABLES IN INSTATIC DB:')
console.log(rows)

const counts = await sql`
  SELECT 
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM products) as products,
    (SELECT COUNT(*) FROM articles) as articles,
    (SELECT COUNT(*) FROM commitments) as commitments,
    (SELECT COUNT(*) FROM about) as about,
    (SELECT COUNT(*) FROM site_settings) as site_settings
`
const rowStats = await sql`SELECT table_id, COUNT(*) as cnt FROM data_rows GROUP BY table_id ORDER BY cnt DESC`
console.log('DATA_ROWS BY TABLE_ID:')
console.log(rowStats)

process.exit(0)
