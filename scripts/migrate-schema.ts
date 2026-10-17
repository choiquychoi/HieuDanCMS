import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

console.log('=== CHẠY MIGRATION CẬP NHẬT CỘT DỮ LIỆU POSTGRESQL ===')

// 1. CẬP NHẬT BẢNG PRODUCTS
console.log('1. Bổ sung các cột đặc thù cho bảng products...')
await sql`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS craftsman VARCHAR(255) DEFAULT 'Nghệ nhân Đức Ngân',
  ADD COLUMN IF NOT EXISTS wood_process VARCHAR(255) DEFAULT 'Gỗ hong khô tự nhiên 5-10 năm',
  ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS year_crafted INTEGER DEFAULT 2025;
`

// Tự động điền mã tác phẩm DN-P01, DN-P02... cho các sản phẩm đã có nếu code đang null
console.log('- Đang điền mã tác phẩm chuẩn DN-P... cho các cây đàn hiện có...')
const products = await sql`SELECT id FROM products ORDER BY id ASC`
for (let i = 0; i < products.length; i++) {
  const code = `DN-P${String(products[i].id).padStart(2, '0')}`
  await sql`
    UPDATE products 
    SET code = COALESCE(code, ${code}),
        craftsman = COALESCE(craftsman, 'Nghệ nhân Đức Ngân'),
        year_crafted = COALESCE(year_crafted, 2025)
    WHERE id = ${products[i].id}
  `
}

// 2. CẬP NHẬT BẢNG ARTICLES
console.log('2. Bổ sung các cột cho bảng articles...')
await sql`
  ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS author VARCHAR(255) DEFAULT 'Nghệ nhân Đức Ngân';
`

await sql`
  UPDATE articles
  SET author = 'Nghệ nhân Đức Ngân'
  WHERE author IS NULL;
`

// 3. CẬP NHẬT BẢNG SITE_SETTINGS
console.log('3. Bổ sung các cột cho bảng site_settings...')
await sql`
  ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS contact_address_branch_2 VARCHAR(255) DEFAULT 'Số 18 phố Huế, Hoàn Kiếm, Hà Nội',
  ADD COLUMN IF NOT EXISTS website_url VARCHAR(255) DEFAULT 'https://ducnganmusic.vn',
  ADD COLUMN IF NOT EXISTS zalo_phone VARCHAR(50) DEFAULT '0903 990 020';
`

await sql`
  UPDATE site_settings
  SET contact_address = 'Số 12 ngõ 45 phố Hào Nam, Đống Đa, Hà Nội',
      contact_address_branch_2 = 'Số 18 phố Huế, Hoàn Kiếm, Hà Nội',
      website_url = 'https://ducnganmusic.vn',
      zalo_phone = '0903 990 020',
      contact_working_hours = '8:00 - 20:30 từ thứ 2 đến chủ nhật'
  WHERE id = 1;
`

console.log('=== MIGRATION HOÀN TẤT THÀNH CÔNG 100%! ===')
await sql.close()
