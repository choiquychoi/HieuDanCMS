import { SQL } from 'bun'
import { jsonResponse, badRequest } from '../../http'

const PG_URL = process.env.DATABASE_URL ?? 'postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db'
let _sql: SQL | null = null

function getSql(): SQL {
  if (!_sql) {
    _sql = new SQL(PG_URL)
  }
  return _sql
}

async function syncArticleToDataRows(sql: SQL, article: any, isDelete = false): Promise<void> {
  const rowId = `art_${article.id}`
  if (isDelete) {
    await sql`DELETE FROM data_rows WHERE id = ${rowId} OR (table_id = 'articles' AND slug = ${article.slug ?? ''})`
    return
  }
  const cells = {
    title: article.title,
    slug: article.slug,
    category: article.category || 'Tư liệu di sản',
    excerpt: article.excerpt || '',
    body: article.content || '',
    featuredMedia: article.thumbnail || '',
    readTime: '5 phút đọc',
    seoTitle: article.title,
    seoDescription: article.excerpt || '',
    author: article.author || 'Nghệ nhân Đức Ngân'
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'articles', ${cells}, ${article.slug}, ${article.status || 'published'}, 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${article.slug},
      status = ${article.status || 'published'},
      updated_at = NOW()
  `
}

async function syncProductToDataRows(sql: SQL, product: any, isDelete = false): Promise<void> {
  const rowId = `prod_${product.id}`
  if (isDelete) {
    await sql`DELETE FROM data_rows WHERE id = ${rowId} OR (table_id = 'products' AND slug = ${product.slug ?? ''})`
    return
  }
  const cells = {
    title: product.name,
    slug: product.slug,
    price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price,
    body: product.description || '',
    origin: product.origin || 'Hiệu Đàn Đức Ngân',
    status: product.status || 'available',
    featured: product.featured ?? false,
    material: product.material || '',
    dimensions: product.dimensions || '',
    category_id: product.category_id ? String(product.category_id) : '',
    featuredMedia: product.image_url || '',
    code: product.code || `DN-P${String(product.id).padStart(2, '0')}`,
    craftsman: product.craftsman || 'Nghệ nhân Đức Ngân',
    wood_process: product.wood_process || '',
    audio_url: product.audio_url || '',
    gallery_urls: product.gallery_urls || [],
    year_crafted: product.year_crafted || 2025,
    seoTitle: product.name,
    seoDescription: product.description || ''
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'products', ${cells}, ${product.slug}, 'published', 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${product.slug},
      status = 'published',
      updated_at = NOW()
  `
}

async function syncCategoryToDataRows(sql: SQL, category: any, isDelete = false): Promise<void> {
  const rowId = `cat_${category.id}`
  if (isDelete) {
    await sql`DELETE FROM data_rows WHERE id = ${rowId} OR (table_id = 'categories' AND slug = ${category.slug ?? ''})`
    return
  }
  const cells = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image_url: category.image_url || '',
    status: category.status || 'active'
  }
  await sql`
    INSERT INTO data_rows (
      id, table_id, cells_json, slug, status, branch_id, created_at, updated_at
    ) VALUES (
      ${rowId}, 'categories', ${cells}, ${category.slug}, 'published', 'main', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = ${cells},
      slug = ${category.slug},
      status = 'published',
      updated_at = NOW()
  `
}

export async function handleDucNganApi(req: Request, url: URL): Promise<Response> {
  const { pathname } = url
  const method = req.method
  const sql = getSql()

  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // 0. CLIENT JS RUNTIME CONTROLLER
  if (pathname === '/admin/api/ducngan/client.js' && method === 'GET') {
    const file = Bun.file(import.meta.dir + '/client.js')
    return new Response(file, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      },
    })
  }

  try {
    // 1. STATS (Dashboard tổng quan)
    if (pathname === '/admin/api/ducngan/stats' && method === 'GET') {
      const [categoriesCount] = await sql`SELECT count(*)::int as count FROM categories`
      const [productsCount] = await sql`SELECT count(*)::int as count FROM products`
      const [articlesCount] = await sql`SELECT count(*)::int as count FROM articles`
      const [commitmentsCount] = await sql`SELECT count(*)::int as count FROM commitments`
      const [aboutCount] = await sql`SELECT count(*)::int as count FROM about`
      const [settingsCount] = await sql`SELECT count(*)::int as count FROM site_settings`

      return jsonResponse({
        categories: categoriesCount?.count ?? 0,
        products: productsCount?.count ?? 0,
        articles: articlesCount?.count ?? 0,
        commitments: commitmentsCount?.count ?? 0,
        about: aboutCount?.count ?? 0,
        settings: settingsCount?.count ?? 0,
      }, { headers: corsHeaders })
    }

    // 2. CATEGORIES
    if (pathname === '/admin/api/ducngan/categories') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM categories ORDER BY COALESCE(hero_order, id) ASC`
        return jsonResponse(rows, { headers: corsHeaders })
      }
      if (method === 'POST') {
        const body = await req.json()
        const [inserted] = await sql`
          INSERT INTO categories (
            name, slug, description, image_url, status, is_hero, hero_order,
            hero_subtitle, hero_audio_url, hero_sound_description, hero_material, hero_crafting
          ) VALUES (
            ${body.name}, ${body.slug}, ${body.description ?? ''}, ${body.image_url ?? ''},
            ${body.status ?? 'active'}, ${body.is_hero ?? false}, ${body.hero_order ?? 0},
            ${body.hero_subtitle ?? ''}, ${body.hero_audio_url ?? ''}, ${body.hero_sound_description ?? ''},
            ${body.hero_material ?? ''}, ${body.hero_crafting ?? ''}
          ) RETURNING *
        `
        if (inserted) {
          await syncCategoryToDataRows(sql, inserted)
        }
        return jsonResponse(inserted, { status: 201, headers: corsHeaders })
      }
    }

    const categoryIdMatch = pathname.match(/^\/admin\/api\/ducngan\/categories\/(\d+)$/)
    if (categoryIdMatch) {
      const id = parseInt(categoryIdMatch[1], 10)
      if (method === 'GET') {
        const [category] = await sql`SELECT * FROM categories WHERE id = ${id}`
        if (!category) return jsonResponse({ error: 'Category not found' }, { status: 404, headers: corsHeaders })
        return jsonResponse(category, { headers: corsHeaders })
      }
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE categories SET
            name = ${body.name},
            slug = ${body.slug},
            description = ${body.description ?? ''},
            image_url = ${body.image_url ?? ''},
            status = ${body.status ?? 'active'},
            is_hero = ${body.is_hero ?? false},
            hero_order = ${body.hero_order ?? 0},
            hero_subtitle = ${body.hero_subtitle ?? ''},
            hero_audio_url = ${body.hero_audio_url ?? ''},
            hero_sound_description = ${body.hero_sound_description ?? ''},
            hero_material = ${body.hero_material ?? ''},
            hero_crafting = ${body.hero_crafting ?? ''},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `
        if (updated) {
          await syncCategoryToDataRows(sql, updated)
        }
        return jsonResponse(updated, { headers: corsHeaders })
      }
      if (method === 'DELETE') {
        const [category] = await sql`SELECT * FROM categories WHERE id = ${id}`
        await sql`DELETE FROM categories WHERE id = ${id}`
        if (category) {
          await syncCategoryToDataRows(sql, category, true)
        }
        return jsonResponse({ success: true }, { headers: corsHeaders })
      }
    }

    // 3. PRODUCTS (Kho nhạc cụ)
    if (pathname === '/admin/api/ducngan/products') {
      if (method === 'GET') {
        const rows = await sql`
          SELECT p.*, c.name as category_name 
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          ORDER BY p.id DESC
        `
        return jsonResponse(rows, { headers: corsHeaders })
      }
      if (method === 'POST') {
        const body = await req.json()
        const slug = body.slug || (body.name ? body.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : `sp-${Date.now()}`)
        const [inserted] = await sql`
          INSERT INTO products (
            name, slug, price, description, material, origin, dimensions,
            status, featured, image_url, category_id,
            code, craftsman, wood_process, audio_url, gallery_urls, year_crafted
          ) VALUES (
            ${body.name}, ${slug}, ${body.price ?? '0'}, ${body.description ?? ''},
            ${body.material ?? ''}, ${body.origin ?? 'Hiệu Đàn Đức Ngân'}, ${body.dimensions ?? ''},
            ${body.status ?? 'available'}, ${body.featured ?? false}, ${body.image_url ?? ''},
            ${body.category_id ? parseInt(body.category_id, 10) : null},
            ${body.code ?? ''}, ${body.craftsman ?? 'Nghệ nhân Đức Ngân'},
            ${body.wood_process ?? 'Gỗ hong khô tự nhiên'}, ${body.audio_url ?? ''},
            ${JSON.stringify(body.gallery_urls ?? [])}::jsonb, ${body.year_crafted ? parseInt(body.year_crafted, 10) : 2025}
          ) RETURNING *
        `
        if (inserted) {
          await syncProductToDataRows(sql, inserted)
        }
        return jsonResponse(inserted, { status: 201, headers: corsHeaders })
      }
    }

    const productIdMatch = pathname.match(/^\/admin\/api\/ducngan\/products\/(\d+)$/)
    if (productIdMatch) {
      const id = parseInt(productIdMatch[1], 10)
      if (method === 'GET') {
        const [product] = await sql`
          SELECT p.*, c.name as category_name 
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.id = ${id}
        `
        if (!product) return jsonResponse({ error: 'Product not found' }, { status: 404, headers: corsHeaders })
        return jsonResponse(product, { headers: corsHeaders })
      }
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE products SET
            name = COALESCE(${body.name}, name),
            price = COALESCE(${body.price !== undefined ? String(body.price) : null}, price),
            description = COALESCE(${body.description}, description),
            material = COALESCE(${body.material}, material),
            origin = COALESCE(${body.origin}, origin),
            dimensions = COALESCE(${body.dimensions}, dimensions),
            status = COALESCE(${body.status}, status),
            featured = COALESCE(${body.featured}, featured),
            image_url = COALESCE(${body.image_url}, image_url),
            category_id = COALESCE(${body.category_id ? parseInt(body.category_id, 10) : null}, category_id),
            code = COALESCE(${body.code}, code),
            craftsman = COALESCE(${body.craftsman}, craftsman),
            wood_process = COALESCE(${body.wood_process}, wood_process),
            audio_url = COALESCE(${body.audio_url}, audio_url),
            gallery_urls = COALESCE(${body.gallery_urls ? JSON.stringify(body.gallery_urls) : null}::jsonb, gallery_urls),
            year_crafted = COALESCE(${body.year_crafted ? parseInt(body.year_crafted, 10) : null}, year_crafted),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `
        if (updated) {
          await syncProductToDataRows(sql, updated)
        }
        return jsonResponse(updated, { headers: corsHeaders })
      }
      if (method === 'DELETE') {
        const [product] = await sql`SELECT * FROM products WHERE id = ${id}`
        await sql`DELETE FROM products WHERE id = ${id}`
        if (product) {
          await syncProductToDataRows(sql, product, true)
        }
        return jsonResponse({ success: true }, { headers: corsHeaders })
      }
    }

    // 4. ARTICLES (Bài viết / Tin tức)
    if (pathname === '/admin/api/ducngan/articles') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM articles ORDER BY id DESC`
        return jsonResponse(rows, { headers: corsHeaders })
      }
      if (method === 'POST') {
        const body = await req.json()
        const slug = body.slug || (body.title ? body.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : `bv-${Date.now()}`)
        const [inserted] = await sql`
          INSERT INTO articles (
            title, slug, excerpt, content, thumbnail, status, category, author, published_at
          ) VALUES (
            ${body.title}, ${slug}, ${body.excerpt ?? ''}, ${body.content ?? ''},
            ${body.thumbnail ?? ''}, ${body.status ?? 'published'}, ${body.category ?? 'Tư liệu di sản'},
            ${body.author ?? 'Nghệ nhân Đức Ngân'}, COALESCE(${body.published_at}, NOW())
          ) RETURNING *
        `
        if (inserted) {
          await syncArticleToDataRows(sql, inserted)
        }
        return jsonResponse(inserted, { status: 201, headers: corsHeaders })
      }
    }

    const articleIdMatch = pathname.match(/^\/admin\/api\/ducngan\/articles\/(\d+)$/)
    if (articleIdMatch) {
      const id = parseInt(articleIdMatch[1], 10)
      if (method === 'GET') {
        const [article] = await sql`SELECT * FROM articles WHERE id = ${id}`
        if (!article) return jsonResponse({ error: 'Article not found' }, { status: 404, headers: corsHeaders })
        return jsonResponse(article, { headers: corsHeaders })
      }
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE articles SET
            title = COALESCE(${body.title}, title),
            excerpt = COALESCE(${body.excerpt}, excerpt),
            content = COALESCE(${body.content}, content),
            thumbnail = COALESCE(${body.thumbnail}, thumbnail),
            status = COALESCE(${body.status}, status),
            category = COALESCE(${body.category}, category),
            author = COALESCE(${body.author}, author),
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `
        if (updated) {
          await syncArticleToDataRows(sql, updated)
        }
        return jsonResponse(updated, { headers: corsHeaders })
      }
      if (method === 'DELETE') {
        const [article] = await sql`SELECT * FROM articles WHERE id = ${id}`
        await sql`DELETE FROM articles WHERE id = ${id}`
        if (article) {
          await syncArticleToDataRows(sql, article, true)
        }
        return jsonResponse({ success: true }, { headers: corsHeaders })
      }
    }

    // 5. ABOUT (Giới thiệu xưởng)
    if (pathname === '/admin/api/ducngan/about') {
      if (method === 'GET') {
        const [row] = await sql`SELECT * FROM about ORDER BY id LIMIT 1`
        return jsonResponse(row ?? {}, { headers: corsHeaders })
      }
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE about SET
            title = ${body.title},
            subtitle = ${body.subtitle ?? ''},
            content = ${body.content ?? ''},
            updated_at = NOW()
          WHERE id = (SELECT id FROM about ORDER BY id LIMIT 1)
          RETURNING *
        `
        return jsonResponse(updated, { headers: corsHeaders })
      }
    }

    // 6. COMMITMENTS (Cam kết Dịch vụ)
    if (pathname === '/admin/api/ducngan/commitments') {
      if (method === 'GET') {
        const rows = await sql`SELECT * FROM commitments ORDER BY sort_order ASC, id ASC`
        return jsonResponse(rows, { headers: corsHeaders })
      }
      if (method === 'POST') {
        const body = await req.json()
        const [inserted] = await sql`
          INSERT INTO commitments (
            index_label, title, short_label, description, image_url, sort_order, is_active
          ) VALUES (
            ${body.index_label ?? '01'}, ${body.title}, ${body.short_label ?? ''},
            ${body.description ?? ''}, ${body.image_url ?? ''}, ${body.sort_order ?? 1},
            ${body.is_active ?? true}
          ) RETURNING *
        `
        return jsonResponse(inserted, { status: 201, headers: corsHeaders })
      }
    }

    const commitmentIdMatch = pathname.match(/^\/admin\/api\/ducngan\/commitments\/(\d+)$/)
    if (commitmentIdMatch) {
      const id = parseInt(commitmentIdMatch[1], 10)
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE commitments SET
            index_label = ${body.index_label ?? '01'},
            title = ${body.title},
            short_label = ${body.short_label ?? ''},
            description = ${body.description ?? ''},
            image_url = ${body.image_url ?? ''},
            sort_order = ${body.sort_order ?? 1},
            is_active = ${body.is_active ?? true},
            updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `
        return jsonResponse(updated, { headers: corsHeaders })
      }
      if (method === 'DELETE') {
        await sql`DELETE FROM commitments WHERE id = ${id}`
        return jsonResponse({ success: true }, { headers: corsHeaders })
      }
    }

    // 7. SITE SETTINGS (Cấu hình hệ thống & Liên hệ)
    if (pathname === '/admin/api/ducngan/site_settings' || pathname === '/admin/api/ducngan/settings') {
      if (method === 'GET') {
        const [row] = await sql`SELECT * FROM site_settings ORDER BY id LIMIT 1`
        return jsonResponse(row ?? {}, { headers: corsHeaders })
      }
      if (method === 'PUT') {
        const body = await req.json()
        const [updated] = await sql`
          UPDATE site_settings SET
            contact_hotline = COALESCE(${body.contact_hotline}, contact_hotline),
            contact_address = COALESCE(${body.contact_address}, contact_address),
            contact_address_branch_2 = COALESCE(${body.contact_address_branch_2}, contact_address_branch_2),
            contact_email = COALESCE(${body.contact_email}, contact_email),
            website_url = COALESCE(${body.website_url}, website_url),
            zalo_phone = COALESCE(${body.zalo_phone}, zalo_phone),
            contact_working_hours = COALESCE(${body.contact_working_hours}, contact_working_hours),
            trust_eyebrow = COALESCE(${body.trust_eyebrow}, trust_eyebrow),
            trust_title = COALESCE(${body.trust_title}, trust_title),
            trust_description = COALESCE(${body.trust_description}, trust_description),
            contact_map_embed = COALESCE(${body.contact_map_embed}, contact_map_embed),
            contact_map_url = COALESCE(${body.contact_map_url}, contact_map_url),
            updated_at = NOW()
          WHERE id = (SELECT id FROM site_settings ORDER BY id LIMIT 1)
          RETURNING *
        `
        return jsonResponse(updated, { headers: corsHeaders })
      }
    }

    return badRequest('Endpoint Đức Ngân không tồn tại')
  } catch (err: any) {
    console.error('[ducngan-api-error]', err)
    return jsonResponse({ error: err.message }, { status: 500, headers: corsHeaders })
  }
}
