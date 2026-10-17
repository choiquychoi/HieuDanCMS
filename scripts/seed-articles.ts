import { SQL } from 'bun'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

await sql`
  UPDATE articles SET category = 'Kỹ thuật chọn gỗ' WHERE id = 1;
`

await sql`
  UPDATE articles SET category = 'Nghệ thuật biểu diễn' WHERE id = 4;
`

const existing2 = await sql`SELECT id FROM articles WHERE slug = 'cau-tao-hop-cong-huong-dan-bau'`
if (existing2.length === 0) {
  await sql`
    INSERT INTO articles (title, slug, excerpt, content, category, status, published_at, created_at, updated_at)
    VALUES (
      'Cấu tạo hộp cộng hưởng và bí quyết tạo tiếng ngân sâu cho đàn bầu',
      'cau-tao-hop-cong-huong-dan-bau',
      'Phân tích kỹ thuật đục khoét hộp âm, lựa chọn gỗ ngô đồng nguyên phiến và góc vát cần đàn tạo độ ngân rung đặc trưng của Độc Huyền Cầm.',
      'Đàn bầu, hay Độc Huyền Cầm, là một trong những nhạc cụ độc đáo bậc nhất thế giới bởi chỉ với một dây duy nhất nhưng lại có thể diễn tấu được cả một bầu trời âm thanh trầm bổng.\n\nTại xưởng Đức Ngân, hộp cộng hưởng của đàn bầu được chế tác từ sự kết hợp tinh tế giữa hai loại gỗ: thành đàn bằng gỗ cẩm lai hoặc trắc già để giữ sự chắc chắn và phản xạ âm thanh, trong khi mặt đàn bắt buộc phải là gỗ ngô đồng xốp nhẹ để dẫn truyền sóng âm tối ưu.\n\nCần đàn uốn từ sừng trâu thật qua nhiều công đoạn gia nhiệt và nắn góc, giúp nghệ sĩ dễ dàng rung, nhấn, vuốt nốt một cách mượt mà nhất.',
      'Lịch sử chế tác',
      'published',
      NOW() - INTERVAL '3 days',
      NOW(),
      NOW()
    )
  `
}

const existing3 = await sql`SELECT id FROM articles WHERE slug = 'phuong-phap-bao-duong-nhac-cu-mua-nom'`
if (existing3.length === 0) {
  await sql`
    INSERT INTO articles (title, slug, excerpt, content, category, status, published_at, created_at, updated_at)
    VALUES (
      'Phương pháp bảo dưỡng mặt gỗ ngô đồng và hệ thống trục dây mùa nồm ẩm',
      'phuong-phap-bao-duong-nhac-cu-mua-nom',
      'Cẩm nang chi tiết hướng dẫn nghệ sĩ và người yêu đàn cách giữ độ căng dây, bảo vệ thớ gỗ và duy trì âm sắc chuẩn xác trong thời tiết khí hậu nhiệt đới.',
      'Khí hậu miền Bắc với mùa nồm ẩm đặc trưng là thử thách lớn đối với các loại nhạc cụ gỗ tự nhiên.\n\nĐối với mặt đàn làm từ gỗ ngô đồng, khi độ ẩm không khí vượt quá 85%, thớ gỗ có xu hướng ngậm nước khiến âm thanh bị đục và giảm độ ngân vang. Để bảo vệ cây đàn:\n\n1. Luôn bảo quản đàn trong bao da hoặc hộp cứng có kèm gói hút ẩm sinh học.\n2. Tránh để đàn tiếp xúc trực tiếp với luồng gió điều hòa hoặc ánh nắng gay gắt.\n3. Thường xuyên lau sạch bụi và mồ hôi tay trên mặt phím sau mỗi buổi tập luyện.',
      'Bảo quản nhạc cụ',
      'published',
      NOW() - INTERVAL '7 days',
      NOW(),
      NOW()
    )
  `
}

const all = await sql`SELECT id, title, category, status FROM articles ORDER BY id ASC`
console.log('Current articles:', all)
await sql.close()
