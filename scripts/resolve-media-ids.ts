import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

// 1. Resolve media IDs in products table:
await sql`
  UPDATE products p
  SET image_url = m.public_path
  FROM media_assets m
  WHERE p.image_url = m.id
`

// Also update data_rows for products if cells_json has media ID in featuredMedia or image_url:
await sql`
  UPDATE data_rows r
  SET cells_json = jsonb_set(r.cells_json, '{featuredMedia}', to_jsonb(m.public_path))
  FROM media_assets m
  WHERE r.table_id = 'products' AND r.cells_json->>'featuredMedia' = m.id
`

// 2. Also enhance the PostgreSQL trigger so future updates from Instatic automatically resolve media IDs!
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
      -- Resolve category_id
      SELECT id INTO cat_id FROM categories WHERE id = NULLIF(c->>'category_id', '')::integer;
      IF cat_id IS NULL THEN
        SELECT id INTO cat_id FROM categories ORDER BY id ASC LIMIT 1;
      END IF;

      -- Resolve image from media_assets if it is an ID
      raw_img := COALESCE(c->>'featuredMedia', c->>'image_url', '');
      IF raw_img <> '' THEN
        -- Check if raw_img matches an asset ID in media_assets
        SELECT public_path INTO resolved_img FROM media_assets WHERE id = raw_img;
        IF resolved_img IS NULL THEN
          -- Not an asset ID, keep raw_img if it starts with / or http
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
        COALESCE((c->>'order')::integer, 0),
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
      UPDATE commitments SET
        title = COALESCE(c->>'title', commitments.title),
        description = COALESCE(c->>'description', commitments.description),
        icon = COALESCE(c->>'icon', commitments.icon),
        sort_order = COALESCE((c->>'order')::integer, commitments.sort_order),
        updated_at = NOW()
      WHERE title = c->>'title';
    END IF;

    -- Sync About
    IF NEW.table_id = 'about' AND NEW.deleted_at IS NULL THEN
      UPDATE about SET
        title = COALESCE(c->>'title', about.title),
        subtitle = COALESCE(c->>'subtitle', about.subtitle),
        content = COALESCE(c->>'story', about.content),
        image_url = COALESCE(c->>'image', about.image_url),
        years_experience = COALESCE((c->>'stat_years')::integer, about.years_experience),
        students_trained = COALESCE((c->>'stat_students')::integer, about.students_trained),
        instruments_crafted = COALESCE((c->>'stat_instruments')::integer, about.instruments_crafted),
        updated_at = NOW();
    END IF;

    -- Sync Site Settings
    IF NEW.table_id = 'site_settings' AND NEW.deleted_at IS NULL THEN
      UPDATE site_settings SET
        site_name = COALESCE(c->>'site_name', site_settings.site_name),
        hotline = COALESCE(c->>'hotline', site_settings.hotline),
        address = COALESCE(c->>'address', site_settings.address),
        email = COALESCE(c->>'email', site_settings.email),
        facebook_url = COALESCE(c->>'facebook_url', site_settings.facebook_url),
        youtube_url = COALESCE(c->>'youtube_url', site_settings.youtube_url),
        footer_quote = COALESCE(c->>'footer_quote', site_settings.footer_quote),
        updated_at = NOW();
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`

const prods = await sql`SELECT id, name, slug, image_url FROM products`
console.log('PRODUCTS AFTER RESOLVING IMAGES:', prods)

process.exit(0)
