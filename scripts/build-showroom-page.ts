import { Window } from 'happy-dom'
import { SQL } from 'bun'

const win = new Window()
globalThis.DOMParser = win.DOMParser as unknown as typeof DOMParser
globalThis.Document = win.Document as unknown as typeof Document
globalThis.Element = win.Element as unknown as typeof Element
globalThis.HTMLElement = win.HTMLElement as unknown as typeof HTMLElement
globalThis.Node = win.Node as unknown as typeof Node

import '../src/modules/base'
import { importHtml } from '../src/core/htmlImport'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

async function run() {
  console.log('--- GENERATING NATIVE INSTATIC SHOWROOM & BOOKING PAGE ---')

  const htmlContent = `
    <!-- HEADER -->
    <header style="background-color: #0c1017; border-bottom: 1px solid #1e293b; padding: 18px 32px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🎻</span>
        <div>
          <div style="font-size: 18px; font-weight: bold; color: #f8fafc; letter-spacing: 1px;">ĐỨC NGÂN MUSIC</div>
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Hiệu Đàn Dân Tộc Cổ Truyền Từ 1999</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 24px;">
        <span style="color: #cbd5e1; font-size: 14px;">Hotline: <strong style="color: #d4af37;">0903 990 020</strong></span>
        <a href="#booking-section" style="padding: 10px 20px; background-color: #d4af37; color: #0f1422; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">Đặt Lịch Thử Đàn</a>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section style="background: radial-gradient(circle at 50% 30%, #1e2638 0%, #0c1017 100%); padding: 80px 24px; text-align: center; color: #ffffff;">
      <div style="display: inline-block; padding: 6px 16px; background-color: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; color: #d4af37; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;">
        ✦ KHÔNG GIAN SHOWROOM NGHỆ THUẬT ✦
      </div>
      <h1 style="font-size: 46px; font-weight: 800; line-height: 1.25; margin-bottom: 20px; color: #ffffff; max-width: 900px; margin-left: auto; margin-right: auto;">
        Trực Tiếp Lắng Nghe & Cảm Nhận <br/><span style="color: #d4af37;">Thanh Âm Mộc Bản Thuần Khiết</span>
      </h1>
      <p style="font-size: 18px; line-height: 1.6; color: #94a3b8; max-width: 720px; margin: 0 auto 36px;">
        Mỗi cây đàn tại Đức Ngân đều được các nghệ nhân chế tác thủ công từ những khối gỗ Mun Hoa, Cẩm Lai, Trắc tuyển chọn trên 20 năm. Chúng tôi trân trọng kính mời quý khách ghé thăm showroom thử phím, so dây và đàm đạo âm nhạc.
      </p>
      <div style="display: flex; justify-content: center; gap: 16px;">
        <a href="#booking-section" style="padding: 14px 32px; background-color: #d4af37; color: #0c1017; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 15px;">
          Đăng Ký Thử Đàn Miễn Phí
        </a>
        <a href="/san-pham" style="padding: 14px 28px; background-color: #1e293b; color: #f8fafc; font-weight: 600; text-decoration: none; border-radius: 8px; font-size: 15px; border: 1px solid #334155;">
          Xem 21 Cây Đàn Tiêu Biểu
        </a>
      </div>
    </section>

    <!-- THREE PILLARS EXPERIENCE -->
    <section style="background-color: #0f1422; padding: 64px 24px; border-bottom: 1px solid #1e293b;">
      <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;">
        <div style="background-color: #161d2d; padding: 32px 24px; border-radius: 12px; border: 1px solid #243046;">
          <div style="font-size: 28px; margin-bottom: 14px;">🪵</div>
          <h3 style="font-size: 18px; font-weight: bold; color: #f8fafc; margin-bottom: 10px;">Gỗ Quý Lâu Năm</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0;">Sấy khô tự nhiên chống cong vênh, thớ gỗ đanh chắc giữ độ ngân vang trong trẻo theo năm tháng.</p>
        </div>
        <div style="background-color: #161d2d; padding: 32px 24px; border-radius: 12px; border: 1px solid #243046;">
          <div style="font-size: 28px; margin-bottom: 14px;">🎼</div>
          <h3 style="font-size: 18px; font-weight: bold; color: #f8fafc; margin-bottom: 10px;">Căn Chỉnh Theo Tay Đàn</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0;">Nghệ nhân trực tiếp hạ phím, cân lực căng dây và thử âm sắc riêng cho từng thể loại nhạc tài tử hay hòa tấu.</p>
        </div>
        <div style="background-color: #161d2d; padding: 32px 24px; border-radius: 12px; border: 1px solid #243046;">
          <div style="font-size: 28px; margin-bottom: 14px;">🛡️</div>
          <h3 style="font-size: 18px; font-weight: bold; color: #f8fafc; margin-bottom: 10px;">Bảo Dưỡng Trọn Đời</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0;">Đồng hành cùng người yêu nhạc từ ngày đầu tập đàn đến khi biểu diễn chuyên nghiệp.</p>
        </div>
      </div>
    </section>

    <!-- BOOKING FORM SECTION (CMS NATIVE FORM TARGETING booking_requests) -->
    <section id="booking-section" style="background-color: #0c1017; padding: 80px 24px;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #161d2d; padding: 48px 40px; border-radius: 16px; border: 1px solid #243046; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
        <div style="text-align: center; margin-bottom: 36px;">
          <div style="font-size: 12px; font-weight: 700; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">ĐẶT LỊCH HẸN TRỰC TIẾP</div>
          <h2 style="font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 12px;">Đón Tiếp Thử Đàn & Đàm Đạo</h2>
          <p style="font-size: 15px; color: #94a3b8; margin: 0;">Vui lòng để lại thông tin, nghệ nhân Đức Ngân sẽ chuẩn bị sẵn cây đàn bạn muốn thử trước giờ hẹn.</p>
        </div>

        <form data-form-id="booking_form" data-target-table="booking_requests" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Họ và tên của bạn *</label>
              <input type="text" name="customer_name" required placeholder="Ví dụ: Nguyễn Văn An" style="width: 100%; padding: 12px 16px; background-color: #0c1017; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Số điện thoại liên hệ *</label>
              <input type="tel" name="phone" required placeholder="Ví dụ: 0912 345 678" style="width: 100%; padding: 12px 16px; background-color: #0c1017; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; box-sizing: border-box;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Nhạc cụ quan tâm thử tiếng</label>
              <select name="instrument_interest" style="width: 100%; padding: 12px 16px; background-color: #0c1017; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; box-sizing: border-box;">
                <option value="Đàn Tranh 19 Dây Mun Hoa">Đàn Tranh 19 Dây Mun Hoa</option>
                <option value="Đàn Bầu Gỗ Cẩm Lai">Đàn Bầu Gỗ Cẩm Lai</option>
                <option value="Đàn Kìm (Nguyệt) Cổ Điển">Đàn Kìm (Nguyệt) Cổ Điển</option>
                <option value="Đàn Nhị (Cò) Gỗ Mun">Đàn Nhị (Cò) Gỗ Mun</option>
                <option value="Đàn Guitar Phím Lõm">Đàn Guitar Phím Lõm</option>
                <option value="Đặt chế tác theo yêu cầu riêng">Đặt chế tác theo yêu cầu riêng</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Ngày hẹn dự kiến</label>
              <input type="text" name="appointment_date" placeholder="Ví dụ: Chiều thứ 7 tuần này" style="width: 100%; padding: 12px 16px; background-color: #0c1017; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; box-sizing: border-box;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: #cbd5e1; margin-bottom: 8px;">Yêu cầu riêng về âm sắc / Kích thước</label>
            <textarea name="note" rows="3" placeholder="Ví dụ: Tôi thích âm sắc trầm ấm, muốn thử loại dây tơ tự nhiên..." style="width: 100%; padding: 12px 16px; background-color: #0c1017; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; box-sizing: border-box;"></textarea>
          </div>

          <button type="submit" style="width: 100%; padding: 16px; background-color: #d4af37; color: #0c1017; font-weight: 700; font-size: 16px; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            Xác Nhận Đặt Lịch Hẹn Thử Đàn
          </button>
        </form>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="background-color: #080b10; border-top: 1px solid #1e293b; padding: 40px 24px; text-align: center; color: #64748b; font-size: 14px;">
      <p style="margin-bottom: 8px; color: #cbd5e1;">📍 Showroom: 526 Điện Biên Phủ, Phường 11, Quận 10, TP. Hồ Chí Minh</p>
      <p style="margin-bottom: 8px;">📞 Hotline / Zalo Nghệ Nhân: <strong style="color: #d4af37;">0903 990 020</strong> | Mở cửa: 08:00 - 20:30 hàng ngày</p>
      <p style="margin: 0; font-size: 12px; color: #475569;">© 2026 Hiệu Đàn Đức Ngân — Gìn giữ thanh âm truyền thống Việt Nam.</p>
    </footer>
  `

  const importResult = importHtml(htmlContent)
  console.log(`Parsed ${Object.keys(importResult.nodes).length} nodes with ${importResult.rootIds.length} root sections.`)

  // Retrieve current Home page
  const homeRows = await sql`
    SELECT id, slug, cells_json
    FROM data_rows 
    WHERE table_id = 'pages' AND slug = 'index'
    LIMIT 1
  `

  if (homeRows.length === 0) {
    console.error('Home page not found in data_rows!')
    process.exit(1)
  }

  const home = homeRows[0]
  const currentBody = home.cells_json.body || { nodes: {}, rootNodeId: 'root_body' }
  const rootBodyId = currentBody.rootNodeId || Object.keys(currentBody.nodes)[0] || 'root_body'

  // Construct combined NodeTree
  const combinedNodes: Record<string, any> = {
    ...importResult.nodes,
    [rootBodyId]: {
      id: rootBodyId,
      moduleId: 'base.body',
      props: {},
      classIds: [],
      children: importResult.rootIds,
      parentId: null,
      breakpointOverrides: {}
    }
  }

  // Link all root imported elements to rootBodyId
  for (const rootId of importResult.rootIds) {
    if (combinedNodes[rootId]) {
      combinedNodes[rootId].parentId = rootBodyId
    }
  }

  const updatedCells = {
    ...home.cells_json,
    title: 'Showroom & Đặt Lịch Thử Đàn — Hiệu Đàn Đức Ngân',
    body: {
      nodes: combinedNodes,
      rootNodeId: rootBodyId
    }
  }

  await sql`
    UPDATE data_rows
    SET cells_json = ${updatedCells},
        status = 'published',
        updated_at = NOW()
    WHERE id = ${home.id};
  `

  console.log('--- SHOWROOM & BOOKING PAGE GENERATED SUCCESSFULLY INTO INSTATIC! ---')
  process.exit(0)
}

run()
