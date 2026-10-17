import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

// 1. Test updating a product price in data_rows
console.log('Testing price update in data_rows...')
await sql`
  UPDATE data_rows 
  SET cells_json = cells_json || '{"price": 8600000}'::jsonb 
  WHERE id = 'prod_2'
`

const p = await sql`SELECT name, price FROM products WHERE slug = 'dan-tranh-19-day-go-mun-hoa'`
console.log('PRODUCTS TABLE SYNCED:', p[0])

if (Number(p[0].price) === 8600000) {
  console.log('>>> TRIGGER SYNC TEST: SUCCESS!')
} else {
  console.error('>>> TRIGGER SYNC TEST: FAILED!', p[0])
}

// Revert to original price
await sql`
  UPDATE data_rows 
  SET cells_json = cells_json || '{"price": 8200000}'::jsonb 
  WHERE id = 'prod_2'
`

process.exit(0)
