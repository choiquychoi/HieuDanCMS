import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

async function main() {
  console.log('--- STARTING INSTATIC NATIVE REGISTRATION & SYNC ---')

  // 1. REGISTER DATA TABLES
  const tablesToRegister = [
    {
      id: 'products',
      name: 'Sản phẩm',
      slug: 'products',
      kind: 'postType', // Appears in both Content and Data tabs
      route_base: '/san-pham',
      singular_label: 'Sản phẩm',
      plural_label: 'Kho Sản phẩm',
      primary_field_id: 'title',
      fields_json: [
        { type: 'text', id: 'title', label: 'Tên nhạc cụ', required: true, builtIn: true },
        { type: 'text', id: 'slug', label: 'Đường dẫn (Slug)', required: true, builtIn: true },
        { type: 'number', id: 'price', label: 'Giá bán (VNĐ)', required: true },
        { type: 'text', id: 'category', label: 'Danh mục' },
        { type: 'text', id: 'category_id', label: 'Mã danh mục' },
        { type: 'media', id: 'featuredMedia', label: 'Ảnh đại diện', mediaKind: 'image', builtIn: true },
        { type: 'text', id: 'material', label: 'Chất liệu gỗ / dây' },
        { type: 'text', id: 'origin', label: 'Nơi chế tác / Xuất xứ' },
        { type: 'text', id: 'dimensions', label: 'Kích thước chuẩn' },
        { 
          type: 'select', 
          id: 'status', 
          label: 'Tình trạng hàng', 
          options: [
            { id: 'available', label: 'Còn hàng', value: 'available' },
            { id: 'out_of_stock', label: 'Hết hàng', value: 'out_of_stock' },
            { id: 'order', label: 'Đặt làm riêng', value: 'order' }
          ]
        },
        { type: 'boolean', id: 'featured', label: 'Sản phẩm tiêu biểu' },
        { type: 'richText', id: 'body', label: 'Mô tả chi tiết & Ký sự chế tác', format: 'markdown', builtIn: true },
        { type: 'text', id: 'seoTitle', label: 'Tiêu đề SEO', builtIn: true },
        { type: 'longText', id: 'seoDescription', label: 'Mô tả SEO', builtIn: true }
      ]
    },
    {
      id: 'categories',
      name: 'Danh mục nhạc cụ',
      slug: 'categories',
      kind: 'data',
      route_base: '/danh-muc',
      singular_label: 'Danh mục',
      plural_label: 'Danh mục nhạc cụ',
      primary_field_id: 'name',
      fields_json: [
        { type: 'text', id: 'name', label: 'Tên danh mục', required: true },
        { type: 'text', id: 'slug', label: 'Đường dẫn (Slug)', required: true },
        { type: 'text', id: 'subtitle', label: 'Phụ đề / Câu giới thiệu' },
        { type: 'longText', id: 'description', label: 'Mô tả danh mục' },
        { type: 'media', id: 'image', label: 'Hình ảnh đại diện', mediaKind: 'image' },
        { type: 'number', id: 'order', label: 'Thứ tự hiển thị' }
      ]
    },
    {
      id: 'articles',
      name: 'Tin tức & Bài viết',
      slug: 'articles',
      kind: 'postType',
      route_base: '/tin-tuc',
      singular_label: 'Bài viết',
      plural_label: 'Tin tức & Bài viết',
      primary_field_id: 'title',
      fields_json: [
        { type: 'text', id: 'title', label: 'Tiêu đề bài viết', required: true, builtIn: true },
        { type: 'text', id: 'slug', label: 'Đường dẫn (Slug)', required: true, builtIn: true },
        { type: 'text', id: 'category', label: 'Chuyên mục' },
        { type: 'longText', id: 'excerpt', label: 'Tóm tắt bài viết' },
        { type: 'media', id: 'featuredMedia', label: 'Ảnh bìa bài viết', mediaKind: 'image', builtIn: true },
        { type: 'richText', id: 'body', label: 'Nội dung chi tiết', format: 'markdown', builtIn: true },
        { type: 'text', id: 'readTime', label: 'Thời gian đọc' },
        { type: 'text', id: 'seoTitle', label: 'Tiêu đề SEO', builtIn: true },
        { type: 'longText', id: 'seoDescription', label: 'Mô tả SEO', builtIn: true }
      ]
    },
    {
      id: 'commitments',
      name: 'Cam kết chất lượng',
      slug: 'commitments',
      kind: 'data',
      route_base: '/cam-ket',
      singular_label: 'Cam kết',
      plural_label: 'Cam kết chất lượng',
      primary_field_id: 'title',
      fields_json: [
        { type: 'text', id: 'title', label: 'Tiêu đề cam kết', required: true },
        { type: 'text', id: 'short_label', label: 'Nhãn ngắn gọn' },
        { type: 'longText', id: 'description', label: 'Mô tả chi tiết' },
        { type: 'media', id: 'image_url', label: 'Hình ảnh / Biểu tượng', mediaKind: 'image' },
        { type: 'number', id: 'sort_order', label: 'Thứ tự sắp xếp' }
      ]
    },
    {
      id: 'about',
      name: 'Giới thiệu Đức Ngân',
      slug: 'about',
      kind: 'data',
      route_base: '/gioi-thieu',
      singular_label: 'Giới thiệu',
      plural_label: 'Giới thiệu xưởng đàn',
      primary_field_id: 'title',
      fields_json: [
        { type: 'text', id: 'title', label: 'Tiêu đề thương hiệu', required: true },
        { type: 'text', id: 'subtitle', label: 'Phụ đề' },
        { type: 'richText', id: 'content', label: 'Nội dung giới thiệu & Ký sự', format: 'markdown' }
      ]
    },
    {
      id: 'site_settings',
      name: 'Cài đặt Website',
      slug: 'site-settings',
      kind: 'data',
      route_base: '',
      singular_label: 'Cài đặt',
      plural_label: 'Cài đặt chung',
      primary_field_id: 'contact_hotline',
      fields_json: [
        { type: 'text', id: 'contact_hotline', label: 'Hotline tư vấn', required: true },
        { type: 'text', id: 'contact_address', label: 'Địa chỉ xưởng & Showroom' },
        { type: 'text', id: 'contact_email', label: 'Email liên hệ' },
        { type: 'text', id: 'contact_working_hours', label: 'Giờ mở cửa' },
        { type: 'text', id: 'trust_eyebrow', label: 'Tiêu đề phụ cam kết' },
        { type: 'text', id: 'trust_title', label: 'Tiêu đề khối uy tín' },
        { type: 'longText', id: 'trust_description', label: 'Mô tả khối uy tín' },
        { type: 'text', id: 'contact_map_embed', label: 'Mã nhúng bản đồ (Embed URL)' },
        { type: 'text', id: 'contact_map_url', label: 'Đường dẫn Google Maps (Direct Link)' }
      ]
    }
  ]

  for (const t of tablesToRegister) {
    await sql`
      INSERT INTO data_tables (
        id, branch_id, name, slug, kind, route_base, 
        singular_label, plural_label, primary_field_id, fields_json, system, updated_at
      ) VALUES (
        ${t.id}, 'main', ${t.name}, ${t.slug}, ${t.kind}, ${t.route_base},
        ${t.singular_label}, ${t.plural_label}, ${t.primary_field_id}, ${t.fields_json}, false, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        kind = EXCLUDED.kind,
        route_base = EXCLUDED.route_base,
        singular_label = EXCLUDED.singular_label,
        plural_label = EXCLUDED.plural_label,
        primary_field_id = EXCLUDED.primary_field_id,
        fields_json = EXCLUDED.fields_json,
        updated_at = NOW();
    `
    console.log(`Registered table: ${t.name} (${t.id})`)
  }

  // 2. MIGRATE DATA INTO data_rows AS JSONB OBJECTS
  // Categories
  const existingCats = await sql`SELECT * FROM categories`
  for (const cat of existingCats) {
    const rowId = `cat_${cat.id}`
    const cells = {
      name: cat.name,
      slug: cat.slug,
      subtitle: cat.hero_subtitle || '',
      description: cat.description || '',
      image: cat.image_url || '/images/hero/dan-bau.png',
      order: cat.hero_order || cat.id
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'categories', ${cells}, ${cat.slug}, 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        slug = EXCLUDED.slug,
        status = 'published',
        updated_at = NOW();
    `
  }
  console.log(`Synced ${existingCats.length} categories to data_rows`)

  // Products
  const existingProds = await sql`SELECT * FROM products`
  for (const p of existingProds) {
    const rowId = `prod_${p.id}`
    const cells = {
      title: p.name,
      slug: p.slug,
      price: Number(p.price) || 0,
      category_id: String(p.category_id),
      featuredMedia: p.image_url || '/images/hero/dan-tranh.png',
      material: p.material || '',
      origin: p.origin || 'Hiệu Đàn Đức Ngân',
      dimensions: p.dimensions || '',
      status: p.status || 'available',
      featured: Boolean(p.featured),
      body: p.description || '',
      seoTitle: p.name,
      seoDescription: p.description || ''
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'products', ${cells}, ${p.slug}, 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        slug = EXCLUDED.slug,
        status = 'published',
        updated_at = NOW();
    `
  }
  console.log(`Synced ${existingProds.length} products to data_rows`)

  // Articles
  const existingArticles = await sql`SELECT * FROM articles`
  for (const a of existingArticles) {
    const rowId = `art_${a.id}`
    const cells = {
      title: a.title,
      slug: a.slug,
      category: a.category || 'Ký sự & Triết lý',
      excerpt: a.excerpt || '',
      featuredMedia: a.thumbnail || '/images/stories/ch1-timber.jpg',
      body: a.content || '',
      readTime: '5 phút đọc',
      seoTitle: a.title,
      seoDescription: a.excerpt || ''
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'articles', ${cells}, ${a.slug}, 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        slug = EXCLUDED.slug,
        status = 'published',
        updated_at = NOW();
    `
  }
  console.log(`Synced ${existingArticles.length} articles to data_rows`)

  // Drop trigger temporarily so syncing does not re-trigger during bulk seeding
  await sql`DROP TRIGGER IF EXISTS trg_sync_instatic_data_row ON data_rows;`

  // Commitments
  const existingCommitments = await sql`SELECT * FROM commitments`
  for (const c of existingCommitments) {
    const rowId = `commit_${c.id}`
    const cells = {
      title: c.title,
      short_label: c.short_label || '',
      description: c.description || '',
      image_url: c.image_url || '/images/trust/trust-01-experience.jpg',
      sort_order: Number(c.sort_order) || c.id
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'commitments', ${cells}, ${'commit-' + c.id}, 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        status = 'published',
        updated_at = NOW();
    `
  }
  console.log(`Synced ${existingCommitments.length} commitments to data_rows`)

  // About
  const existingAbout = await sql`SELECT * FROM about LIMIT 1`
  if (existingAbout.length > 0) {
    const ab = existingAbout[0]
    const rowId = 'about_duc_ngan'
    const cells = {
      title: ab.title || 'Hiệu Đàn Đức Ngân',
      subtitle: ab.subtitle || '',
      content: ab.content || ''
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'about', ${cells}, 've-duc-ngan', 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        status = 'published',
        updated_at = NOW();
    `
    console.log(`Synced about info to data_rows`)
  }

  // Site Settings
  const existingSettings = await sql`SELECT * FROM site_settings LIMIT 1`
  if (existingSettings.length > 0) {
    const st = existingSettings[0]
    const rowId = 'setting_general'
    const cells = {
      contact_hotline: st.contact_hotline || '0903 990 020',
      contact_address: st.contact_address || '526 Điện Biên Phủ, Phường 11, Quận 10, TP. Hồ Chí Minh',
      contact_email: st.contact_email || 'sales@hieudanducngan.com',
      contact_working_hours: st.contact_working_hours || '08:00 - 20:30 (Tất cả các ngày trong tuần)',
      trust_eyebrow: st.trust_eyebrow || 'CAM KẾT TỪ ĐỨC NGÂN',
      trust_title: st.trust_title || 'Tận Tâm Trong Từng Thanh Âm',
      trust_description: st.trust_description || 'Đức Ngân đồng hành cùng người yêu nhạc từ lúc chọn đàn, thử âm sắc cho đến quá trình gìn giữ và bảo dưỡng trọn đời.',
      contact_map_embed: st.contact_map_embed || '',
      contact_map_url: st.contact_map_url || ''
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${rowId}, 'main', 'site_settings', ${cells}, 'cai-dat-chung', 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        status = 'published',
        updated_at = NOW();
    `
    console.log(`Synced site settings to data_rows`)
  }

  // 3. CREATE VISUAL COMPONENTS IN components TABLE FOR DRAG AND DROP
  const visualComponents = [
    {
      id: 'vc_hero_banner',
      name: 'Đức Ngân - Hero Banner',
      slug: 'duc-ngan-hero-banner',
      body: {
        rootNodeId: 'hero_root',
        nodes: {
          hero_root: {
            id: 'hero_root',
            type: 'container',
            parentId: null,
            children: ['hero_badge', 'hero_heading', 'hero_desc', 'hero_cta'],
            props: {
              layout: 'flex-col',
              padding: '64px 24px',
              backgroundColor: '#0f1422',
              textColor: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px'
            }
          },
          hero_badge: {
            id: 'hero_badge',
            type: 'text',
            parentId: 'hero_root',
            children: [],
            props: {
              content: 'DI SẢN & NGHỆ THUẬT CHẾ TÁC VIỆT NAM',
              textColor: '#d4af37',
              fontSize: '13px',
              fontWeight: 'bold',
              letterSpacing: '2px'
            }
          },
          hero_heading: {
            id: 'hero_heading',
            type: 'text',
            parentId: 'hero_root',
            children: [],
            props: {
              content: 'Hiệu Đàn Đức Ngân — Tiếng Vang Của Hồn Việt',
              fontSize: '42px',
              fontWeight: 'bold',
              textColor: '#ffffff',
              textAlign: 'center'
            }
          },
          hero_desc: {
            id: 'hero_desc',
            type: 'text',
            parentId: 'hero_root',
            children: [],
            props: {
              content: 'Mỗi cây đàn là một tác phẩm thủ công đúc kết từ hơn 30 năm kinh nghiệm của nghệ nhân làm đàn.',
              fontSize: '16px',
              textColor: '#94a3b8',
              textAlign: 'center',
              maxWidth: '640px'
            }
          },
          hero_cta: {
            id: 'hero_cta',
            type: 'button',
            parentId: 'hero_root',
            children: [],
            props: {
              label: 'Khám phá Bộ sưu tập',
              backgroundColor: '#0008ff',
              textColor: '#ffffff',
              borderRadius: '8px',
              padding: '12px 28px',
              href: '/san-pham'
            }
          }
        }
      }
    },
    {
      id: 'vc_product_card',
      name: 'Đức Ngân - Thẻ Nhạc Cụ (Product Card)',
      slug: 'duc-ngan-product-card',
      body: {
        rootNodeId: 'card_root',
        nodes: {
          card_root: {
            id: 'card_root',
            type: 'container',
            parentId: null,
            children: ['card_img', 'card_title', 'card_price', 'card_btn'],
            props: {
              layout: 'flex-col',
              padding: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }
          },
          card_img: {
            id: 'card_img',
            type: 'image',
            parentId: 'card_root',
            children: [],
            props: {
              src: '/images/hero/dan-tranh.png',
              alt: 'Đàn Tranh',
              height: '220px',
              objectFit: 'contain'
            }
          },
          card_title: {
            id: 'card_title',
            type: 'text',
            parentId: 'card_root',
            children: [],
            props: {
              content: 'Đàn Tranh 19 Dây Gỗ Mun Hoa',
              fontSize: '18px',
              fontWeight: '600',
              textColor: '#0f172a'
            }
          },
          card_price: {
            id: 'card_price',
            type: 'text',
            parentId: 'card_root',
            children: [],
            props: {
              content: '8.200.000 đ',
              fontSize: '16px',
              fontWeight: 'bold',
              textColor: '#0008ff'
            }
          },
          card_btn: {
            id: 'card_btn',
            type: 'button',
            parentId: 'card_root',
            children: [],
            props: {
              label: 'Xem chi tiết',
              backgroundColor: '#f1f5f9',
              textColor: '#0f172a',
              borderRadius: '6px',
              padding: '8px 16px'
            }
          }
        }
      }
    },
    {
      id: 'vc_commitment_badge',
      name: 'Đức Ngân - Cam Kết Vàng',
      slug: 'duc-ngan-commitment-badge',
      body: {
        rootNodeId: 'badge_root',
        nodes: {
          badge_root: {
            id: 'badge_root',
            type: 'container',
            parentId: null,
            children: ['badge_title', 'badge_desc'],
            props: {
              layout: 'flex-col',
              padding: '24px',
              backgroundColor: '#F8FAFC',
              borderLeft: '4px solid #0008ff',
              borderRadius: '8px'
            }
          },
          badge_title: {
            id: 'badge_title',
            type: 'text',
            parentId: 'badge_root',
            children: [],
            props: {
              content: 'Gỗ Tự Nhiên Sấy Khô Trên 10 Năm',
              fontSize: '17px',
              fontWeight: 'bold',
              textColor: '#0f172a'
            }
          },
          badge_desc: {
            id: 'badge_desc',
            type: 'text',
            parentId: 'badge_root',
            children: [],
            props: {
              content: 'Cam kết không cong vênh, âm thanh vang chuẩn và bền vững theo năm tháng.',
              fontSize: '14px',
              textColor: '#64748b'
            }
          }
        }
      }
    }
  ]

  for (const vc of visualComponents) {
    const cells = {
      name: vc.name,
      slug: vc.slug,
      body: vc.body,
      params: [],
      classIds: ''
    }
    await sql`
      INSERT INTO data_rows (
        id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
      ) VALUES (
        ${vc.id}, 'main', 'components', ${cells}, ${vc.slug}, 'published', NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        cells_json = EXCLUDED.cells_json,
        slug = EXCLUDED.slug,
        status = 'published',
        updated_at = NOW();
    `
    console.log(`Registered Visual Component: ${vc.name}`)
  }

  // 4. CREATE ROBUST POSTGRESQL TWO-WAY SYNC TRIGGER
  await sql`
    CREATE OR REPLACE FUNCTION sync_instatic_data_row_to_table()
    RETURNS TRIGGER AS $$
    DECLARE
      c jsonb;
      cat_id integer;
      raw_img text;
      resolved_img text;
    BEGIN
      c := NEW.cells_json;
      
      -- Sync Products
      IF NEW.table_id = 'products' AND NEW.deleted_at IS NULL THEN
        -- Safely resolve category_id
        SELECT id INTO cat_id FROM categories WHERE id = NULLIF(c->>'category_id', '')::integer;
        IF cat_id IS NULL THEN
          SELECT id INTO cat_id FROM categories ORDER BY id ASC LIMIT 1;
        END IF;

        -- Resolve image from media_assets if it is an ID
        raw_img := COALESCE(c->>'featuredMedia', c->>'image_url', '');
        IF raw_img <> '' THEN
          SELECT public_path INTO resolved_img FROM media_assets WHERE id = raw_img;
          IF resolved_img IS NULL THEN
            IF raw_img LIKE '/%' OR raw_img LIKE 'http%' THEN
              resolved_img := raw_img;
            ELSE
              resolved_img := '/images/hero/dan-tranh.png';
            END IF;
          END IF;
        ELSE
          resolved_img := '/images/hero/dan-tranh.png';
        END IF;

        INSERT INTO products (
          name, slug, price, category_id, image_url, material, origin, dimensions, status, featured, description, updated_at
        ) VALUES (
          COALESCE(c->>'title', c->>'name', 'Nhạc cụ mới'),
          NEW.slug,
          COALESCE((c->>'price')::numeric, 0),
          cat_id,
          resolved_img,
          COALESCE(c->>'material', ''),
          COALESCE(c->>'origin', 'Hiệu Đàn Đức Ngân'),
          COALESCE(c->>'dimensions', ''),
          COALESCE(c->>'status', 'available'),
          COALESCE((c->>'featured')::boolean, false),
          COALESCE(c->>'body', c->>'description', ''),
          NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          category_id = EXCLUDED.category_id,
          image_url = EXCLUDED.image_url,
          material = EXCLUDED.material,
          origin = EXCLUDED.origin,
          dimensions = EXCLUDED.dimensions,
          status = EXCLUDED.status,
          featured = EXCLUDED.featured,
          description = EXCLUDED.description,
          updated_at = NOW();
      END IF;

      -- Sync Categories
      IF NEW.table_id = 'categories' AND NEW.deleted_at IS NULL THEN
        raw_img := COALESCE(c->>'image', c->>'image_url', '');
        IF raw_img <> '' THEN
          SELECT public_path INTO resolved_img FROM media_assets WHERE id = raw_img;
          IF resolved_img IS NULL THEN
            IF raw_img LIKE '/%' OR raw_img LIKE 'http%' THEN
              resolved_img := raw_img;
            ELSE
              resolved_img := '/images/hero/dan-bau.png';
            END IF;
          END IF;
        ELSE
          resolved_img := '/images/hero/dan-bau.png';
        END IF;

        INSERT INTO categories (
          name, slug, hero_subtitle, description, image_url, hero_order, updated_at
        ) VALUES (
          COALESCE(c->>'name', 'Danh mục'),
          NEW.slug,
          COALESCE(c->>'subtitle', ''),
          COALESCE(c->>'description', ''),
          resolved_img,
          COALESCE((c->>'sort_order')::integer, (c->>'order')::integer, 0),
          NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          hero_subtitle = EXCLUDED.hero_subtitle,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          hero_order = EXCLUDED.hero_order,
          updated_at = NOW();
      END IF;

      -- Sync Articles
      IF NEW.table_id = 'articles' AND NEW.deleted_at IS NULL THEN
        raw_img := COALESCE(c->>'featuredMedia', c->>'thumbnail', '');
        IF raw_img <> '' THEN
          SELECT public_path INTO resolved_img FROM media_assets WHERE id = raw_img;
          IF resolved_img IS NULL THEN
            IF raw_img LIKE '/%' OR raw_img LIKE 'http%' THEN
              resolved_img := raw_img;
            ELSE
              resolved_img := '/images/stories/ch1-timber.jpg';
            END IF;
          END IF;
        ELSE
          resolved_img := '/images/stories/ch1-timber.jpg';
        END IF;

        INSERT INTO articles (
          title, slug, excerpt, content, thumbnail, category, status, published_at, updated_at
        ) VALUES (
          COALESCE(c->>'title', 'Bài viết'),
          NEW.slug,
          COALESCE(c->>'excerpt', ''),
          COALESCE(c->>'body', c->>'content', ''),
          resolved_img,
          COALESCE(c->>'category', 'Ký sự & Triết lý'),
          'published',
          NOW(),
          NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          thumbnail = EXCLUDED.thumbnail,
          category = EXCLUDED.category,
          updated_at = NOW();
      END IF;

      -- Sync Commitments
      IF NEW.table_id = 'commitments' AND NEW.deleted_at IS NULL THEN
        raw_img := COALESCE(c->>'image_url', c->>'image', '');
        IF raw_img <> '' THEN
          SELECT public_path INTO resolved_img FROM media_assets WHERE id = raw_img;
          IF resolved_img IS NULL THEN
            IF raw_img LIKE '/%' OR raw_img LIKE 'http%' THEN
              resolved_img := raw_img;
            ELSE
              resolved_img := '/images/trust/trust-01-experience.jpg';
            END IF;
          END IF;
        ELSE
          resolved_img := '/images/trust/trust-01-experience.jpg';
        END IF;

        UPDATE commitments SET
          title = COALESCE(c->>'title', commitments.title),
          short_label = COALESCE(c->>'short_label', commitments.short_label),
          description = COALESCE(c->>'description', commitments.description),
          image_url = resolved_img,
          sort_order = COALESCE((c->>'sort_order')::integer, (c->>'order')::integer, commitments.sort_order),
          updated_at = NOW()
        WHERE title = c->>'title' OR id = NULLIF(REPLACE(NEW.id, 'commit_', ''), '')::integer;
      END IF;

      -- Sync About
      IF NEW.table_id = 'about' AND NEW.deleted_at IS NULL THEN
        UPDATE about SET
          title = COALESCE(c->>'title', about.title),
          subtitle = COALESCE(c->>'subtitle', about.subtitle),
          content = COALESCE(c->>'content', c->>'story', about.content),
          updated_at = NOW();
      END IF;

      -- Sync Site Settings
      IF NEW.table_id = 'site_settings' AND NEW.deleted_at IS NULL THEN
        UPDATE site_settings SET
          contact_hotline = COALESCE(c->>'contact_hotline', c->>'hotline', site_settings.contact_hotline),
          contact_address = COALESCE(c->>'contact_address', c->>'address', site_settings.contact_address),
          contact_email = COALESCE(c->>'contact_email', c->>'email', site_settings.contact_email),
          contact_working_hours = COALESCE(c->>'contact_working_hours', site_settings.contact_working_hours),
          trust_eyebrow = COALESCE(c->>'trust_eyebrow', site_settings.trust_eyebrow),
          trust_title = COALESCE(c->>'trust_title', site_settings.trust_title),
          trust_description = COALESCE(c->>'trust_description', site_settings.trust_description),
          contact_map_embed = COALESCE(c->>'contact_map_embed', site_settings.contact_map_embed),
          contact_map_url = COALESCE(c->>'contact_map_url', site_settings.contact_map_url),
          updated_at = NOW();
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `

  await sql`DROP TRIGGER IF EXISTS trg_sync_instatic_data_row ON data_rows;`
  await sql`
    CREATE TRIGGER trg_sync_instatic_data_row
    AFTER INSERT OR UPDATE ON data_rows
    FOR EACH ROW
    EXECUTE FUNCTION sync_instatic_data_row_to_table();
  `

  console.log('Automated two-way synchronization trigger registered successfully!')
  console.log('--- ALL INSTATIC NATIVE INTEGRATIONS FINISHED ---')
  process.exit(0)
}

main().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
