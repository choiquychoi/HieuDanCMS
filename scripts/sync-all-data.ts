import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

console.log('=== ĐỒNG BỘ TOÀN DIỆN DỮ LIỆU POSTGRES VÀ INSTATIC DATA_ROWS ===')

// 1. ĐỒNG BỘ ARTICLES
console.log('1. Đồng bộ bảng Articles...')
const pgArticles = await sql`SELECT * FROM articles ORDER BY id ASC`
console.log(`- Có ${pgArticles.length} bài viết trong PostgreSQL articles`)

// Xóa các row trong data_rows không còn tồn tại trong public.articles
const pgArticleSlugs = new Set(pgArticles.map(a => a.slug))
const pgArticleIds = new Set(pgArticles.map(a => `art_${a.id}`))
const currentInstaticArticles = await sql`SELECT id, slug FROM data_rows WHERE table_id = 'articles'`

for (const row of currentInstaticArticles) {
  if (!pgArticleIds.has(row.id) && !pgArticleSlugs.has(row.slug)) {
    console.log(`- Đang xóa bài viết thừa trong data_rows: ${row.id} (${row.slug})`)
    await sql`DELETE FROM data_rows WHERE id = ${row.id}`
  }
}

// Cập nhật hoặc chèn các bài viết từ PostgreSQL vào data_rows
for (const a of pgArticles) {
  const rowId = `art_${a.id}`
  const cells = {
    title: a.title,
    slug: a.slug,
    category: a.category || 'Tư liệu di sản',
    excerpt: a.excerpt || '',
    body: a.content || '',
    featuredMedia: a.thumbnail || '',
    readTime: '5 phút đọc',
    seoTitle: a.title,
    seoDescription: a.excerpt || '',
    author: a.author || 'Nghệ nhân Đức Ngân'
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'articles', ${cells}, ${a.slug}, ${a.status || 'published'}, 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${a.slug},
      status = ${a.status || 'published'},
      updated_at = NOW()
  `
  console.log(`- Đã đồng bộ bài viết ${rowId}: ${a.title}`)
}

// 2. ĐỒNG BỘ PRODUCTS
console.log('2. Đồng bộ bảng Products...')
const pgProducts = await sql`
  SELECT p.*, c.name as category_name 
  FROM products p 
  LEFT JOIN categories c ON p.category_id = c.id
  ORDER BY p.id ASC
`
console.log(`- Có ${pgProducts.length} sản phẩm trong PostgreSQL products`)

const pgProductIds = new Set(pgProducts.map(p => `prod_${p.id}`))
const pgProductSlugs = new Set(pgProducts.map(p => p.slug))
const currentInstaticProducts = await sql`SELECT id, slug FROM data_rows WHERE table_id = 'products'`

for (const row of currentInstaticProducts) {
  if (!pgProductIds.has(row.id) && !pgProductSlugs.has(row.slug)) {
    console.log(`- Đang xóa sản phẩm thừa trong data_rows: ${row.id} (${row.slug})`)
    await sql`DELETE FROM data_rows WHERE id = ${row.id}`
  }
}

for (const p of pgProducts) {
  const rowId = `prod_${p.id}`
  const cells = {
    title: p.name,
    slug: p.slug,
    price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price,
    body: p.description || '',
    origin: p.origin || 'Hiệu Đàn Đức Ngân',
    status: p.status || 'available',
    featured: p.featured ?? false,
    material: p.material || '',
    dimensions: p.dimensions || '',
    category_id: p.category_id ? String(p.category_id) : '',
    featuredMedia: p.image_url || '',
    code: p.code || `DN-P${String(p.id).padStart(2, '0')}`,
    craftsman: p.craftsman || 'Nghệ nhân Đức Ngân',
    wood_process: p.wood_process || '',
    audio_url: p.audio_url || '',
    gallery_urls: p.gallery_urls || [],
    year_crafted: p.year_crafted || 2025,
    seoTitle: p.name,
    seoDescription: p.description || ''
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'products', ${cells}, ${p.slug}, 'published', 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${p.slug},
      status = 'published',
      updated_at = NOW()
  `
}

// 3. ĐỒNG BỘ CATEGORIES
console.log('3. Đồng bộ bảng Categories...')
const pgCategories = await sql`SELECT * FROM categories ORDER BY id ASC`
for (const c of pgCategories) {
  const rowId = `cat_${c.id}`
  const cells = {
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    image_url: c.image_url || '',
    status: c.status || 'active'
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'categories', ${cells}, ${c.slug}, 'published', 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${c.slug},
      status = 'published',
      updated_at = NOW()
  `
}

// 4. KIỂM TRA SỐ LƯỢNG SAU ĐỒNG BỘ
const finalArtPg = await sql`SELECT count(*) FROM articles`
const finalArtInstatic = await sql`SELECT count(*) FROM data_rows WHERE table_id = 'articles' AND deleted_at IS NULL`
const finalProdPg = await sql`SELECT count(*) FROM products`
const finalProdInstatic = await sql`SELECT count(*) FROM data_rows WHERE table_id = 'products' AND deleted_at IS NULL`
const finalCatPg = await sql`SELECT count(*) FROM categories`
const finalCatInstatic = await sql`SELECT count(*) FROM data_rows WHERE table_id = 'categories' AND deleted_at IS NULL`

console.log('=== KẾT QUẢ ĐỒNG BỘ ===')
console.log({
  articles: { pg: finalArtPg[0].count, instatic: finalArtInstatic[0].count },
  products: { pg: finalProdPg[0].count, instatic: finalProdInstatic[0].count },
  categories: { pg: finalCatPg[0].count, instatic: finalCatInstatic[0].count },
})

await sql.close()
