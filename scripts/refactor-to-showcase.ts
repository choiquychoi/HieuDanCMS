import { Window } from 'happy-dom'
import { SQL } from 'bun'
import { nanoid } from 'nanoid'
import { createDbClient } from '../server/db'
import { publishDraftSite } from '../server/publish/publishSite'

const win = new Window()
globalThis.DOMParser = win.DOMParser as unknown as typeof DOMParser
globalThis.Document = win.Document as unknown as typeof Document
globalThis.Element = win.Element as unknown as typeof Element
globalThis.HTMLElement = win.HTMLElement as unknown as typeof HTMLElement
globalThis.Node = win.Node as unknown as typeof Node

import '../src/modules/base'
import { importHtml } from '../src/core/htmlImport'

const sql = new SQL('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')

function formatVnd(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (!num || isNaN(num) || num <= 0) return 'Liên hệ nghệ nhân'
  return num.toLocaleString('vi-VN') + ' đ'
}

// BỘ SIDEBAR ĐỒNG BỘ 100% CHO WEBSITE SHOWCASE / QUẢN TRỊ THƯƠNG HIỆU
// Tuyệt đối không icon, không emoji, không ngoặc đơn, typography thanh lịch
function getSharedSidebarHtml(activeSlug: string): string {
  const isDashboard = activeSlug === 'index'
  const isProduct = activeSlug === 'san-pham' || activeSlug === 'san-pham-editor'
  const isCategory = activeSlug === 'danh-muc'
  const isMedia = activeSlug === 'media'
  const isArticle = activeSlug === 'bai-viet' || activeSlug === 'bai-viet-editor'
  const isSetting = activeSlug === 'cai-dat'

  const activeStyle = 'display: block; padding: 12px 18px; background-color: #ffffff; color: #1e40af; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);'
  const normalStyle = 'display: block; padding: 12px 18px; color: #dbeafe; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;'

  return `
    <aside style="width: 250px; min-width: 250px; background-color: #1e40af; color: #ffffff; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="padding: 24px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 17px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">ĐỨC NGÂN MUSIC</div>
            <div style="font-size: 11px; color: #93c5fd; margin-top: 2px;">Quản trị thương hiệu</div>
          </div>
          <button style="background: rgba(255, 255, 255, 0.15); border: none; color: #ffffff; width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            &lt;
          </button>
        </div>

        <nav style="padding: 20px 14px; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 11px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 12px;">
            Trưng bày
          </div>

          <a href="/admin/site" style="${isDashboard ? activeStyle : normalStyle}">
            Tổng quan
          </a>

          <a href="/san-pham" style="${isProduct ? activeStyle : normalStyle}">
            Sản phẩm
          </a>

          <a href="/danh-muc" style="${isCategory ? activeStyle : normalStyle}">
            Danh mục
          </a>

          <div style="font-size: 11px; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 12px 6px;">
            Tài nguyên &amp; Cài đặt
          </div>

          <a href="/admin/media" style="${isMedia ? activeStyle : normalStyle}">
            Thư viện Media
          </a>

          <a href="/bai-viet" style="${isArticle ? activeStyle : normalStyle}">
            Bài viết
          </a>

          <a href="/cai-dat" style="${isSetting ? activeStyle : normalStyle}">
            Cài đặt
          </a>
        </nav>
      </div>

      <div style="padding: 18px 20px; border-top: 1px solid rgba(255, 255, 255, 0.12); background-color: rgba(0, 0, 0, 0.08);">
        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">Đức Ngân</div>
        <div style="font-size: 12px; color: #bfdbfe;">Quản trị xưởng đàn</div>
      </div>
    </aside>
  `
}

// 1. TRANG DASHBOARD GIỚI THIỆU DOANH NGHIỆP / SHOWCASE (slug: index)
function getShowcaseDashboardHtml(stats: { products: number; categories: number; articles: number }, topProducts: any[], topArticles: any[]): string {
  const sidebarHtml = getSharedSidebarHtml('index')

  const productRowsHtml = topProducts.map((p) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: 600; color: #2563eb;">DN-P${String(p.id).padStart(2, '0')}</td>
      <td style="padding: 12px; font-weight: 700; color: #0f172a;">${p.name}</td>
      <td style="padding: 12px; color: #475569;">${p.category_name || 'Nhạc cụ truyền thống'}</td>
      <td style="padding: 12px; font-weight: 700; color: #0f172a;">${formatVnd(p.price)}</td>
      <td style="padding: 12px;"><span style="padding: 2px 6px; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; border-radius: 4px;">Đang trưng bày</span></td>
    </tr>
  `).join('')

  const articleRowsHtml = topArticles.map((a) => `
    <div style="padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
      <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${a.title}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 3px;">${a.category || 'Tư liệu di sản'} &bull; Đã xuất bản</div>
    </div>
  `).join('')

  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Quản trị &gt; Tổng quan</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Bảng điều khiển xưởng đàn Đức Ngân</h1>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="text" placeholder="Tìm kiếm tác phẩm, bài viết..." style="width: 260px; padding: 10px 14px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; outline: none;" />
            <a href="/san-pham" style="padding: 10px 18px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 8px;">
              Xem bộ sưu tập
            </a>
          </div>
        </header>

        <section style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Tác phẩm nhạc cụ</div>
            <div style="font-size: 26px; font-weight: 800; color: #1e40af; margin: 8px 0 4px 0;">${stats.products}</div>
            <div style="font-size: 12px; color: #64748b;">Đang trưng bày tại showroom</div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Dòng nhạc cụ</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">${stats.categories}</div>
            <div style="font-size: 12px; color: #64748b;">Dân tộc và truyền thống</div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Tư liệu &amp; Bài viết</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">${stats.articles}</div>
            <div style="font-size: 12px; color: #16a34a; font-weight: 600;">Đã lưu trữ và xuất bản</div>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Showroom trưng bày</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">2</div>
            <div style="font-size: 12px; color: #64748b;">Cơ sở Hào Nam &amp; Phố Huế</div>
          </div>
        </section>

        <div style="display: grid; grid-template-columns: 1.35fr 1fr; gap: 24px;">
          
          <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Tác phẩm nhạc cụ tiêu biểu</h2>
              <a href="/san-pham" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none;">Xem tất cả &gt;</a>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; font-size: 12px;">
                  <th style="padding: 10px 12px;">Mã</th>
                  <th style="padding: 10px 12px;">Tên tác phẩm</th>
                  <th style="padding: 10px 12px;">Chủng loại</th>
                  <th style="padding: 10px 12px;">Giá sản phẩm</th>
                  <th style="padding: 10px 12px;">Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                ${productRowsHtml}
              </tbody>
            </table>
          </div>

          <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Tư liệu &amp; Bài viết di sản</h2>
              <a href="/bai-viet" style="font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: none;">Xem tất cả &gt;</a>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${articleRowsHtml}
            </div>
          </div>

        </div>

        <section style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); padding: 22px; display: flex; flex-direction: column; gap: 12px;">
          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0;">Showroom trưng bày Đức Ngân</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
            <div style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: #2563eb;">Cơ sở 1</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 4px 0;">Số 12 ngõ 45 phố Hào Nam</div>
              <div style="font-size: 12px; color: #64748b;">Đống Đa, Hà Nội</div>
            </div>
            <div style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: #2563eb;">Cơ sở 2</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 4px 0;">Số 18 phố Huế</div>
              <div style="font-size: 12px; color: #64748b;">Hoàn Kiếm, Hà Nội</div>
            </div>
            <div style="padding: 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: #2563eb;">Giờ đón khách &amp; Hotline</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 4px 0;">0903 990 020</div>
              <div style="font-size: 12px; color: #64748b;">8:00 - 20:30 từ thứ 2 đến chủ nhật</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  `
}

// 2. TRANG BỘ SƯU TẬP SẢN PHẨM (slug: san-pham)
function getShowcaseProductListHtml(products: any[], categories: any[]): string {
  const sidebarHtml = getSharedSidebarHtml('san-pham')

  const totalCount = products.length
  const displayingCount = Math.min(totalCount, 18)
  const archiveCount = Math.max(0, totalCount - displayingCount)

  const categoryButtonsHtml = `
    <button style="padding: 7px 14px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">
      Tất cả
    </button>
  ` + categories.map((c) => `
    <button style="padding: 7px 14px; background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
      ${c.name}
    </button>
  `).join('')

  const productTableRowsHtml = products.map((p, idx) => {
    const isArchive = idx >= 18
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 14px; font-weight: 600; color: #2563eb;">DN-P${String(p.id).padStart(2, '0')}</td>
        <td style="padding: 14px; font-weight: 700; color: #0f172a;">${p.name}</td>
        <td style="padding: 14px; color: #475569;">${p.category_name || 'Nhạc cụ truyền thống'}</td>
        <td style="padding: 14px; color: #475569; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.material || 'Gỗ tự nhiên nguyên khối'}</td>
        <td style="padding: 14px; font-weight: 700; color: #0f172a;">${formatVnd(p.price)}</td>
        <td style="padding: 14px;">
          ${isArchive ? `
            <span style="padding: 3px 8px; background-color: #f1f5f9; color: #475569; font-weight: 700; font-size: 11px; border-radius: 4px;">
              Lưu trữ xưởng
            </span>
          ` : `
            <span style="padding: 3px 8px; background-color: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; border-radius: 4px;">
              Đang trưng bày
            </span>
          `}
        </td>
        <td style="padding: 14px; text-align: center;">
          <a href="/san-pham-editor?id=${p.id}" style="display: inline-block; padding: 5px 12px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 5px; font-weight: 700; text-decoration: none; font-size: 12px; margin-right: 4px;">
            Sửa
          </a>
          <button style="padding: 5px 10px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 5px; font-weight: 600; font-size: 12px; cursor: pointer;">
            Xóa
          </button>
        </td>
      </tr>
    `
  }).join('')

  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Trưng bày &gt; Sản phẩm</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Bộ sưu tập nhạc cụ trưng bày</h1>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="text" placeholder="Tìm tên tác phẩm, mã đàn..." style="width: 260px; padding: 10px 14px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; outline: none;" />
            <a href="/san-pham-editor" style="padding: 10px 18px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 8px;">
              Thêm tác phẩm mới
            </a>
          </div>
        </header>

        <section style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Tổng tác phẩm</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">${totalCount}</div>
            <div style="font-size: 12px; color: #64748b;">Mẫu đàn được lưu danh mục</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Đang trưng bày</div>
            <div style="font-size: 26px; font-weight: 800; color: #16a34a; margin: 8px 0 4px 0;">${displayingCount}</div>
            <div style="font-size: 12px; color: #16a34a;">Có mặt tại showroom</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Bộ sưu tập lưu trữ</div>
            <div style="font-size: 26px; font-weight: 800; color: #1e40af; margin: 8px 0 4px 0;">${archiveCount}</div>
            <div style="font-size: 12px; color: #1e40af;">Mẫu đàn nghệ nhân lưu trữ</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Dòng nhạc cụ</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 8px 0 4px 0;">${categories.length}</div>
            <div style="font-size: 12px; color: #64748b;">Chủng loại truyền thống</div>
          </div>
        </section>

        <section style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); padding: 22px; display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;">
            <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0;">Danh mục tác phẩm chế tác</h2>
            <div style="display: flex; gap: 8px;">
              <a href="/san-pham-editor" style="padding: 8px 16px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700;">
                Thêm tác phẩm mới
              </a>
            </div>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${categoryButtonsHtml}
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; font-size: 12px;">
                  <th style="padding: 12px 14px;">Mã</th>
                  <th style="padding: 12px 14px;">Tên tác phẩm</th>
                  <th style="padding: 12px 14px;">Chủng loại</th>
                  <th style="padding: 12px 14px;">Chất liệu gỗ</th>
                  <th style="padding: 12px 14px;">Giá sản phẩm</th>
                  <th style="padding: 12px 14px;">Trạng thái trưng bày</th>
                  <th style="padding: 12px 14px; text-align: center;">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                ${productTableRowsHtml}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f1f5f9;">
            <div style="font-size: 12px; color: #64748b;">
              Hiển thị 1 - ${totalCount} của ${totalCount} tác phẩm
            </div>
            <div style="display: flex; gap: 4px;">
              <button style="padding: 5px 10px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 5px; font-size: 12px; font-weight: 700;">1</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  `
}

// 3. TRANG SẢN PHẨM EDITOR CHO SHOWCASE (slug: san-pham-editor)
function getShowcaseProductEditorHtml(categories: any[]): string {
  const sidebarHtml = getSharedSidebarHtml('san-pham-editor')

  const categoryOptionsHtml = categories.map((c, idx) => `
    <option value="${c.id}" ${idx === 0 ? 'selected' : ''}>${c.name}</option>
  `).join('')

  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 2px;">
              <a href="/san-pham" style="color: #2563eb; text-decoration: none;">&larr; Bộ sưu tập sản phẩm</a>
            </div>
            <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0;">
              Soạn thảo tác phẩm nhạc cụ
            </h1>
          </div>

          <div style="display: flex; gap: 10px;">
            <a href="/san-pham" style="padding: 9px 18px; background-color: #f1f5f9; color: #475569; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 13px; border: 1px solid #cbd5e1;">
              Hủy và quay lại
            </a>
            <a href="/san-pham" style="display: inline-block; padding: 9px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 6px; font-size: 13px;">
              Lưu tác phẩm
            </a>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background-color: #ffffff; padding: 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
              <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                Thông tin tác phẩm
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Tên tác phẩm nhạc cụ
                </label>
                <input type="text" value="Đàn Kìm Gỗ Trắc Cổ Truyền" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Mã tác phẩm
                  </label>
                  <input type="text" value="DN-P03" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Chủng loại
                  </label>
                  <select style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;">
                    ${categoryOptionsHtml}
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Giá sản phẩm
                  </label>
                  <input type="text" value="6.800.000 đ" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600; color: #0f172a; box-sizing: border-box;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Chất liệu thân &amp; mặt đàn
                </label>
                <input type="text" value="Gỗ Trắc, mặt gỗ Ngô Đồng già nguyên phiến, 10 phím trúc" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Nghệ nhân chế tác
                  </label>
                  <input type="text" value="Nghệ nhân Trần Đức Ngân trực tiếp cân phím" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Tuổi thọ gỗ &amp; quy trình xử lý
                  </label>
                  <input type="text" value="Gỗ trắc cổ hong khô tự nhiên 12 năm" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Mô tả âm sắc &amp; Đặc tính nghệ thuật
                </label>
                <textarea rows="5" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #0f172a; line-height: 1.6; box-sizing: border-box;">Cây đàn được chế tác thủ công từ khối gỗ trắc cổ truyền, giữ trọn độ ngân vang đầm ấm và âm sắc mộc bản thanh thoát. Các phím trúc được cân cữ chuẩn tay phục vụ biểu diễn nghệ thuật truyền thống và sưu tập tư liệu di sản.</textarea>
              </div>
            </div>

            <div style="background-color: #ffffff; padding: 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
              <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                Tài nguyên Media &amp; Tệp tin gắn kèm
              </h2>

              <div style="border: 2px dashed #93c5fd; background-color: #eff6ff; padding: 24px 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 13px; font-weight: 700; color: #1d4ed8; margin-bottom: 12px;">
                  Ảnh đại diện chính của cây đàn
                </div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                  <a href="/admin/media" style="display: inline-block; padding: 8px 18px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 700;">
                    Chọn từ thư viện
                  </a>
                  <button style="padding: 8px 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; color: #334155;">
                    Tải ảnh mới
                  </button>
                </div>
              </div>

              <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a;">Album ảnh thớ gỗ &amp; chi tiết phím</div>
                  <div style="font-size: 12px; color: #64748b;">Chọn nhiều ảnh chụp góc cạnh thực tế từ xưởng</div>
                </div>
                <a href="/admin/media" style="padding: 7px 14px; background-color: #ffffff; color: #2563eb; border: 1px solid #bfdbfe; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700;">
                  Chọn từ thư viện
                </a>
              </div>

              <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 18px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a;">File âm thanh thử tiếng đàn</div>
                  <div style="font-size: 12px; color: #64748b;">File audio thu âm nghệ nhân diễn tấu thử âm sắc</div>
                </div>
                <a href="/admin/media" style="padding: 7px 14px; background-color: #ffffff; color: #2563eb; border: 1px solid #bfdbfe; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700;">
                  Chọn từ thư viện
                </a>
              </div>

            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background-color: #ffffff; padding: 22px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
              <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                Trưng bày &amp; Giới thiệu
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Trạng thái trưng bày
                </label>
                <select style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;">
                  <option selected>Đang trưng bày tại showroom</option>
                  <option>Bộ sưu tập lưu trữ xưởng</option>
                  <option>Tạm ẩn</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Năm chế tác
                </label>
                <input type="text" value="2025" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
                <span style="font-size: 13px; font-weight: 700; color: #334155;">Hiển thị trên website giới thiệu</span>
                <input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer;" />
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
                <a href="/san-pham" style="text-align: center; display: block; padding: 11px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 700;">
                  Lưu tác phẩm
                </a>
                <a href="/san-pham" style="text-align: center; padding: 8px; color: #64748b; font-size: 13px; text-decoration: none; font-weight: 600;">
                  Hủy và quay lại
                </a>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  `
}

// 4. TRANG CÀI ĐẶT SHOWROOM DOANH NGHIỆP (slug: cai-dat)
function getShowcaseSettingsHtml(): string {
  const sidebarHtml = getSharedSidebarHtml('cai-dat')
  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Tài nguyên &amp; Cài đặt &gt; Cài đặt</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Cài đặt thông tin thương hiệu &amp; Showroom</h1>
          </div>
          <div style="display: flex; gap: 10px;">
            <button style="padding: 9px 18px; background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
              Đặt lại mặc định
            </button>
            <button style="padding: 9px 20px; background-color: #2563eb; color: #ffffff; border: none; font-weight: 700; border-radius: 6px; font-size: 13px; cursor: pointer;">
              Lưu cài đặt
            </button>
          </div>
        </header>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Hồ sơ doanh nghiệp &amp; Câu chuyện xưởng đàn
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Tên thương hiệu xưởng đàn
                </label>
                <input type="text" value="Hiệu Đàn Dân Tộc Đức Ngân" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Sứ mệnh xưởng đàn và nghệ thuật truyền thống
                </label>
                <textarea rows="4" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #0f172a; line-height: 1.6; box-sizing: border-box;">Bảo tồn và phục dựng nghệ thuật chế tác nhạc cụ dân tộc cổ truyền Việt Nam từ năm 1999. Mỗi cây đàn là một tác phẩm thủ công độc bản được căn chỉnh riêng theo cữ tay nghệ nhân biểu diễn, gìn giữ hồn cốt âm nhạc dân gian.</textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Hotline nghệ nhân tư vấn trực tiếp
                  </label>
                  <input type="text" value="0903 990 020" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Giờ đón tiếp khách thử âm
                  </label>
                  <input type="text" value="8:00 - 20:30 từ thứ 2 đến chủ nhật" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
              </div>
            </div>

            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Hệ thống 2 Showroom trưng bày
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Showroom Cơ sở 1
                </label>
                <input type="text" value="Số 12 ngõ 45 phố Hào Nam, Đống Đa, Hà Nội" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Showroom Cơ sở 2
                </label>
                <input type="text" value="Số 18 phố Huế, Hoàn Kiếm, Hà Nội" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Email liên hệ xưởng
                  </label>
                  <input type="text" value="ducnganmusic@gmail.com" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    Website chính thức
                  </label>
                  <input type="text" value="https://ducnganmusic.vn" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
                </div>
              </div>
            </div>

          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Xuất bản hồ sơ
              </h2>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0;">
                <span style="font-size: 13px; font-weight: 600; color: #334155;">Hiển thị thông tin liên hệ trên web</span>
                <input type="checkbox" checked style="width: 18px; height: 18px; cursor: pointer;" />
              </div>
              <button style="width: 100%; padding: 12px; background-color: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px;">
                Lưu thông tin showroom
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  `
}

// 5. TRANG DANH MỤC PHÂN LOẠI NHẠC CỤ (slug: danh-muc)
function getShowcaseCategoryListHtml(categories: any[], categoryCounts: Record<string, number>): string {
  const sidebarHtml = getSharedSidebarHtml('danh-muc')

  const totalInstruments = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  const rowsHtml = categories.map((c) => {
    const count = categoryCounts[c.name] ?? 0
    return `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 16px 24px; font-weight: 700; color: #0f172a;">${c.name}</td>
        <td style="padding: 16px 20px; color: #64748b; font-family: monospace;">${c.slug ? c.slug.toUpperCase() : 'DANH-MUC'}</td>
        <td style="padding: 16px 20px; font-weight: 600; color: #0f172a;">${count} tác phẩm</td>
        <td style="padding: 16px 20px; color: #334155;">Nghệ nhân Đức Ngân</td>
        <td style="padding: 16px 20px;">
          <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700;">Đang trưng bày</span>
        </td>
        <td style="padding: 16px 24px; text-align: right;">
          <button style="padding: 6px 12px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; margin-right: 6px;">Sửa</button>
          <button style="padding: 6px 12px; background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">Xóa</button>
        </td>
      </tr>
    `
  }).join('')

  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Trưng bày &gt; Danh mục</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Danh mục phân loại nhạc cụ</h1>
          </div>

          <button style="padding: 10px 18px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 13px; border: none; border-radius: 8px; cursor: pointer;">
            Thêm phân loại mới
          </button>
        </header>

        <section style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Tổng phân loại</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 6px;">${categories.length}</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Tác phẩm trưng bày</div>
            <div style="font-size: 26px; font-weight: 800; color: #2563eb; margin-top: 6px;">${totalInstruments}</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Showroom trưng bày</div>
            <div style="font-size: 26px; font-weight: 800; color: #059669; margin-top: 6px;">2</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Quy chuẩn chế tác</div>
            <div style="font-size: 26px; font-weight: 800; color: #d97706; margin-top: 6px;">Thủ công</div>
          </div>
        </section>

        <section style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); overflow: hidden;">
          <div style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Danh sách dòng nhạc cụ truyền thống</div>
            <input type="text" placeholder="Tìm kiếm dòng nhạc cụ..." style="width: 240px; padding: 8px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;" />
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 14px 24px; font-weight: 700;">Tên phân loại</th>
                <th style="padding: 14px 20px; font-weight: 700;">Mã phân loại</th>
                <th style="padding: 14px 20px; font-weight: 700;">Số tác phẩm</th>
                <th style="padding: 14px 20px; font-weight: 700;">Nghệ nhân phụ trách</th>
                <th style="padding: 14px 20px; font-weight: 700;">Trạng thái</th>
                <th style="padding: 14px 24px; font-weight: 700; text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  `
}

// 6. TRANG BÀI VIẾT & TƯ LIỆU DI SẢN (slug: bai-viet)
function getShowcaseArticleListHtml(articles: any[]): string {
  const sidebarHtml = getSharedSidebarHtml('bai-viet')

  const rowsHtml = articles.map((a) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 16px 24px; font-weight: 700; color: #0f172a; max-width: 320px;">${a.title}</td>
      <td style="padding: 16px 20px; color: #64748b;">${a.category || 'Tư liệu di sản'}</td>
      <td style="padding: 16px 20px; color: #334155;">Nghệ nhân Đức Ngân</td>
      <td style="padding: 16px 20px; color: #64748b;">${a.published_at ? new Date(a.published_at).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</td>
      <td style="padding: 16px 20px;">
        <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700;">Đã xuất bản</span>
      </td>
      <td style="padding: 16px 24px; text-align: right;">
        <a href="/bai-viet-editor?id=${a.id}" style="display: inline-block; padding: 6px 12px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; color: #0f172a; text-decoration: none; margin-right: 6px;">Sửa</a>
        <button style="padding: 6px 12px; background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">Xóa</button>
      </td>
    </tr>
  `).join('')

  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Tài nguyên &amp; Cài đặt &gt; Bài viết</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Tư liệu &amp; Kiến thức di sản</h1>
          </div>

          <a href="/bai-viet-editor" style="padding: 10px 18px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 8px;">
            Soạn tư liệu mới
          </a>
        </header>

        <section style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Tổng số bài viết</div>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 6px;">${articles.length}</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Đã xuất bản</div>
            <div style="font-size: 26px; font-weight: 800; color: #059669; margin-top: 6px;">${articles.length}</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Bản thảo lưu trữ</div>
            <div style="font-size: 26px; font-weight: 800; color: #d97706; margin-top: 6px;">0</div>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size: 13px; font-weight: 600; color: #64748b;">Chuyên mục tư liệu</div>
            <div style="font-size: 26px; font-weight: 800; color: #2563eb; margin-top: 6px;">4</div>
          </div>
        </section>

        <section style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); overflow: hidden;">
          <div style="padding: 16px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">Danh sách bài viết &amp; nghiên cứu</div>
            <input type="text" placeholder="Tìm kiếm bài viết..." style="width: 240px; padding: 8px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;" />
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 12px; text-transform: uppercase;">
                <th style="padding: 14px 24px; font-weight: 700;">Tiêu đề tư liệu</th>
                <th style="padding: 14px 20px; font-weight: 700;">Chuyên mục</th>
                <th style="padding: 14px 20px; font-weight: 700;">Tác giả</th>
                <th style="padding: 14px 20px; font-weight: 700;">Ngày đăng</th>
                <th style="padding: 14px 20px; font-weight: 700;">Trạng thái</th>
                <th style="padding: 14px 24px; font-weight: 700; text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  `
}

// 7. TRANG SOẠN THẢO BÀI VIẾT (slug: bai-viet-editor)
function getShowcaseArticleEditorHtml(): string {
  const sidebarHtml = getSharedSidebarHtml('bai-viet-editor')
  return `
    <div style="display: flex; min-height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      ${sidebarHtml}

      <main style="flex: 1; padding: 32px 36px; display: flex; flex-direction: column; gap: 24px; overflow-y: auto;">
        
        <header style="display: flex; justify-content: space-between; align-items: center; background-color: #ffffff; padding: 18px 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">Tài nguyên &amp; Cài đặt &gt; Bài viết &gt; Soạn thảo</div>
            <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">Soạn thảo tư liệu di sản</h1>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <a href="/bai-viet" style="padding: 10px 18px; background-color: #f1f5f9; color: #475569; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 8px; border: 1px solid #cbd5e1;">
              Hủy và quay lại
            </a>
            <a href="/bai-viet" style="padding: 10px 18px; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 8px;">
              Lưu bài viết
            </a>
          </div>
        </header>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 16px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Nội dung tư liệu
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Tiêu đề bài viết
                </label>
                <input type="text" value="Nghệ thuật tuyển chọn gỗ quý trong chế tác nhạc cụ dân tộc" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: 600; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Chuyên mục tư liệu
                </label>
                <select style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;">
                  <option selected>Kỹ thuật chọn gỗ</option>
                  <option>Lịch sử chế tác</option>
                  <option>Bảo quản nhạc cụ</option>
                  <option>Nghệ thuật biểu diễn</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Tóm tắt tư liệu
                </label>
                <textarea rows="3" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box; line-height: 1.5;">Gỗ trắc đen, mun sừng và ngô đồng lâu năm là linh hồn tạo nên độ ngân vang và độ bền phím của nhạc cụ truyền thống. Bài viết phân tích các thớ vân gỗ và độ tuổi gỗ đạt chuẩn cho âm sắc mẫu mực.</textarea>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Thân bài viết &amp; Trình soạn thảo phong phú
                </label>

                <!-- Visual WYSIWYG Editor Toolbar -->
                <div style="display: flex; gap: 6px; padding: 8px 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-bottom: none; border-radius: 6px 6px 0 0; flex-wrap: wrap; align-items: center;">
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 700; color: #334155; cursor: pointer;">
                    Tiêu đề lớn
                  </button>
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 700; color: #334155; cursor: pointer;">
                    Tiêu đề phụ
                  </button>
                  <div style="width: 1px; height: 18px; background-color: #cbd5e1; margin: 0 4px;"></div>
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 800; color: #334155; cursor: pointer;">
                    In đậm
                  </button>
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-style: italic; color: #334155; cursor: pointer;">
                    In nghiêng
                  </button>
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
                    Trích dẫn
                  </button>
                  <button type="button" style="padding: 5px 10px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #334155; cursor: pointer;">
                    Danh sách
                  </button>
                  <div style="width: 1px; height: 18px; background-color: #cbd5e1; margin: 0 4px;"></div>
                  <a href="/admin/media" style="padding: 5px 12px; background-color: #2563eb; color: #ffffff; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none;">
                    Chèn ảnh từ Media
                  </a>
                </div>

                <textarea rows="14" style="width: 100%; padding: 14px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 0 0 6px 6px; font-size: 14px; color: #0f172a; box-sizing: border-box; line-height: 1.7; font-family: inherit;">Để hoàn thiện một tác phẩm nhạc cụ chuẩn mực, việc tuyển chọn gỗ chiếm tới hơn 50% sự thành công của âm sắc. Tại xưởng Đức Ngân, từng phiến gỗ đều trải qua quá trình phơi hong tự nhiên từ 3 đến 5 năm trong điều kiện thoáng gió trước khi bước vào công đoạn đục đẽo và ghép thân đàn.

Mặt đàn thường được lựa chọn từ gỗ ngô đồng nguyên tấm với những đường vân thẳng tắp, không tì vết. Hộp cộng hưởng kết hợp giữa thành gỗ trắc chắc nịch và mặt ngô đồng xốp nhẹ giúp âm thanh phát ra vừa sâu lắng, vừa ngân vang rành rọt từng nốt nhạc.

Nghệ nhân Đức Ngân chia sẻ: 'Gỗ có tuổi đời càng cao thì thớ càng đanh, tiếng đàn đánh ra càng có hồn và không bị phô theo thời tiết.'</textarea>
              </div>
            </div>

          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Xuất bản
              </h2>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Trạng thái
                </label>
                <select style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;">
                  <option selected>Đã xuất bản</option>
                  <option>Bản thảo lưu trữ</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Tác giả nghiên cứu
                </label>
                <input type="text" value="Nghệ nhân Đức Ngân" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                  Ngày ghi nhận
                </label>
                <input type="text" value="07/10/2026" style="width: 100%; padding: 10px 12px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #0f172a; box-sizing: border-box;" />
              </div>

              <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                <a href="/bai-viet" style="display: block; text-align: center; padding: 12px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 700;">
                  Lưu bài viết
                </a>
                <a href="/bai-viet" style="display: block; text-align: center; padding: 12px; background-color: #f1f5f9; color: #475569; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 700; border: 1px solid #cbd5e1;">
                  Quay lại danh sách
                </a>
              </div>
            </div>

            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 14px;">
              <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                Hình ảnh tư liệu
              </h2>
              <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px; text-align: center; background-color: #f8fafc;">
                <div style="font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 12px;">Kéo thả ảnh hoặc chọn từ thư viện</div>
                <div style="display: flex; justify-content: center; gap: 8px;">
                  <a href="/admin/media" style="padding: 7px 14px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700;">
                    Chọn từ thư viện
                  </a>
                  <button style="padding: 7px 14px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                    Tải ảnh mới
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  `
}

async function upsertPage(slug: string, title: string, html: string, authorId: string) {
  const fragment = importHtml(html)
  const rootBodyId = `root_${slug.replace(/-/g, '_')}_body`
  const combinedNodes: Record<string, any> = {
    ...fragment.nodes,
    [rootBodyId]: {
      id: rootBodyId,
      moduleId: 'base.body',
      props: {},
      classIds: [],
      children: fragment.rootIds,
      parentId: null,
      breakpointOverrides: {}
    }
  }
  for (const rootId of fragment.rootIds) {
    if (combinedNodes[rootId]) combinedNodes[rootId].parentId = rootBodyId
  }

  const cells = {
    title,
    slug,
    body: {
      nodes: combinedNodes,
      rootNodeId: rootBodyId
    }
  }

  const existing = await sql`SELECT id FROM data_rows WHERE table_id = 'pages' AND slug = ${slug}`
  if (existing.length > 0) {
    await sql`
      UPDATE data_rows
      SET cells_json = ${cells},
          status = 'published',
          updated_at = NOW()
      WHERE id = ${existing[0].id};
    `
    console.log(`- Đã cập nhật trang ${slug} (${existing[0].id})`)
  } else {
    const newId = nanoid()
    await sql`
      INSERT INTO data_rows (
        id, table_id, cells_json, slug, status, author_user_id, branch_id, created_at, updated_at
      ) VALUES (
        ${newId}, 'pages', ${cells}, ${slug}, 'published', ${authorId}, 'main', NOW(), NOW()
      );
    `
    console.log(`- Đã tạo mới trang ${slug} (${newId})`)
  }
}

async function run() {
  console.log('=== CHUYỂN ĐỔI TOÀN DIỆN KHU VỰC QUẢN LÝ NỘI DUNG (CONTENT MANAGEMENT HUB) ===')

  // Xóa bỏ hoàn toàn trang don-hang và khach-hang nếu còn sót
  await sql`DELETE FROM data_rows WHERE table_id = 'pages' AND slug IN ('don-hang', 'khach-hang')`

  // 1. LẤY DỮ LIỆU THỰC TẾ TỪ POSTGRESQL
  console.log('1. Lấy dữ liệu thật từ PostgreSQL duc_ngan_db...')
  const products = await sql`
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id ASC
  `
  const categories = await sql`SELECT * FROM categories ORDER BY id ASC`
  const articles = await sql`SELECT * FROM articles ORDER BY id ASC`

  const categoryCounts: Record<string, number> = {}
  for (const c of categories) {
    categoryCounts[c.name] = products.filter((p: any) => p.category_id === c.id).length
  }

  const stats = {
    products: products.length,
    categories: categories.length,
    articles: articles.length
  }

  const home = (await sql`SELECT author_user_id FROM data_rows WHERE table_id = 'pages' AND slug = 'index'`)[0]
  const authorId = home?.author_user_id || 'SWLB0UU5-gxliq-fbmjG9'

  // 2. Cập nhật Dashboard Tổng quan (slug: index)
  console.log('2. Cập nhật trang Tổng quan (index)...')
  const topProducts = products.slice(0, 5)
  const topArticles = articles.slice(0, 3)
  await upsertPage('index', 'Tổng quan — Đức Ngân Admin', getShowcaseDashboardHtml(stats, topProducts, topArticles), authorId)

  // 3. Cập nhật Bộ sưu tập sản phẩm (slug: san-pham)
  console.log('3. Cập nhật trang Bộ sưu tập sản phẩm (san-pham)...')
  await upsertPage('san-pham', 'Sản phẩm — Đức Ngân Admin', getShowcaseProductListHtml(products, categories), authorId)

  // 4. Cập nhật Soạn thảo sản phẩm (slug: san-pham-editor)
  console.log('4. Cập nhật trang Soạn thảo sản phẩm (san-pham-editor)...')
  await upsertPage('san-pham-editor', 'Sản phẩm — Đức Ngân Admin', getShowcaseProductEditorHtml(categories), authorId)

  // 5. Cập nhật Danh mục phân loại (slug: danh-muc)
  console.log('5. Cập nhật trang Danh mục (danh-muc)...')
  await upsertPage('danh-muc', 'Danh mục — Đức Ngân Admin', getShowcaseCategoryListHtml(categories, categoryCounts), authorId)

  // 6. Cập nhật Tư liệu & Bài viết (slug: bai-viet)
  console.log('6. Cập nhật trang Bài viết (bai-viet)...')
  await upsertPage('bai-viet', 'Bài viết — Đức Ngân Admin', getShowcaseArticleListHtml(articles), authorId)

  // 7. Cập nhật Soạn thảo bài viết (slug: bai-viet-editor)
  console.log('7. Cập nhật trang Soạn thảo bài viết (bai-viet-editor)...')
  await upsertPage('bai-viet-editor', 'Bài viết — Đức Ngân Admin', getShowcaseArticleEditorHtml(), authorId)

  // 8. Cập nhật Cài đặt thương hiệu & Showroom (slug: cai-dat)
  console.log('8. Cập nhật trang Cài đặt (cai-dat)...')
  await upsertPage('cai-dat', 'Cài đặt — Đức Ngân Admin', getShowcaseSettingsHtml(), authorId)

  // 9. Làm sạch collab_documents cache
  console.log('9. Làm sạch collab_documents cache...')
  await sql`DELETE FROM collab_documents`

  // 10. Xuất bản đồng bộ (Publish Draft Site)
  console.log('10. Đồng bộ xuất bản toàn bộ 7 trang ra live...')
  const { db } = createDbClient('postgres://postgres:123456@127.0.0.1:5432/duc_ngan_db')
  const pubRes = await publishDraftSite(db, authorId, './uploads')
  console.log('Kết quả xuất bản:', pubRes)

  await sql.close()
  console.log('=== HOÀN TẤT TRIỂN KHAI TOÀN DIỆN KHU VỰC QUẢN LÝ NỘI DUNG 100%! ===')
}

run().catch((err) => {
  console.error('LỖI:', err)
  process.exit(1)
})
