import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

async function run() {
  console.log('--- CREATING BOOKING REQUESTS DATA TABLE IN INSTATIC ---')

  const table = {
    id: 'booking_requests',
    name: 'Đặt lịch thử đàn & Tư vấn',
    slug: 'booking-requests',
    kind: 'data',
    route_base: '',
    singular_label: 'Phiếu đặt lịch',
    plural_label: 'Danh sách Đặt lịch hẹn',
    primary_field_id: 'customer_name',
    fields_json: [
      { type: 'text', id: 'customer_name', label: 'Họ và tên quý khách', required: true },
      { type: 'text', id: 'phone', label: 'Số điện thoại', required: true },
      { type: 'text', id: 'email', label: 'Email liên hệ' },
      { type: 'text', id: 'instrument_interest', label: 'Nhạc cụ muốn thử' },
      { type: 'text', id: 'appointment_date', label: 'Ngày hẹn dự kiến' },
      { type: 'text', id: 'time_slot', label: 'Khung giờ tiếp đón' },
      { type: 'longText', id: 'note', label: 'Lời nhắn / Yêu cầu âm sắc' },
      { type: 'text', id: 'status', label: 'Trạng thái xử lý' }
    ]
  }

  await sql`
    INSERT INTO data_tables (
      id, branch_id, name, slug, kind, route_base, 
      singular_label, plural_label, primary_field_id, fields_json, system, updated_at
    ) VALUES (
      ${table.id}, 'main', ${table.name}, ${table.slug}, ${table.kind}, ${table.route_base},
      ${table.singular_label}, ${table.plural_label}, ${table.primary_field_id}, ${table.fields_json}, false, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      kind = EXCLUDED.kind,
      fields_json = EXCLUDED.fields_json,
      updated_at = NOW();
  `
  console.log('Table booking_requests registered successfully in data_tables!')

  // Seed sample booking row
  const sampleCells = {
    customer_name: 'Nguyễn Văn An',
    phone: '0912 345 678',
    email: 'an.nguyen@gmail.com',
    instrument_interest: 'Đàn Tranh 19 Dây Gỗ Mun Hoa',
    appointment_date: '2026-10-10',
    time_slot: '09:30 - Sáng',
    note: 'Muốn thử âm sắc mộc và độ căng dây tơ lụa trước khi đặt chế tác riêng.',
    status: 'Chờ đón tiếp'
  }

  await sql`
    INSERT INTO data_rows (
      id, branch_id, table_id, cells_json, slug, status, published_at, updated_at
    ) VALUES (
      'book_sample_01', 'main', 'booking_requests', ${sampleCells}, 'phieu-hen-nguyen-van-an', 'published', NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      cells_json = EXCLUDED.cells_json,
      status = 'published',
      updated_at = NOW();
  `
  console.log('Sample booking request inserted into data_rows!')
  process.exit(0)
}

run()
