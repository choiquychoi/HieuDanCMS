// Client-side JavaScript Controller for Duc Ngan Music CMS
// Handles real-time CRUD, dynamic hydration, instant search, filtering, and WYSIWYG toolbar

(function () {
  'use strict';

  function showToast(message, isError) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 14px 22px;
      background-color: ${isError ? '#dc2626' : '#1e40af'};
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function formatVnd(val) {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (!num || isNaN(num) || num <= 0) return 'Liên hệ nghệ nhân';
    return num.toLocaleString('vi-VN') + ' đ';
  }

  function formatDate(val) {
    if (!val) return 'Mới cập nhật';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return 'Mới cập nhật';
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return 'Mới cập nhật';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    // ─────────────────────────────────────────────────────────────
    // 0. TRANG TỔNG QUAN (DASHBOARD): /admin/site
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/admin/site' || pathname === '/') {
      const statBoxes = document.querySelectorAll('main section:nth-of-type(1) div[style*="background-color: #ffffff"]');
      const productTableTbody = document.querySelector('table tbody');
      const articleContainer = document.querySelector('main div[style*="grid-template-columns: 1.35fr 1fr"] > div:nth-child(2) > div[style*="flex-direction: column"]');

      // Hydrate stats
      fetch('/admin/api/ducngan/stats')
        .then((r) => r.json())
        .then((s) => {
          if (s && statBoxes.length >= 3) {
            const numProd = statBoxes[0].querySelector('div[style*="font-size: 26px"]');
            if (numProd) numProd.textContent = String(s.products ?? 0);

            const numCat = statBoxes[1].querySelector('div[style*="font-size: 26px"]');
            if (numCat) numCat.textContent = String(s.categories ?? 0);

            const numArt = statBoxes[2].querySelector('div[style*="font-size: 26px"]');
            if (numArt) numArt.textContent = String(s.articles ?? 0);
          }
        })
        .catch(() => {});

      // Hydrate recent products
      if (productTableTbody) {
        fetch('/admin/api/ducngan/products')
          .then((r) => r.json())
          .then((products) => {
            if (Array.isArray(products) && products.length > 0) {
              const top5 = products.slice(0, 5);
              productTableTbody.innerHTML = top5.map((p) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-weight: 600; color: #2563eb;">${p.code || 'DN-P' + String(p.id).padStart(2, '0')}</td>
                  <td style="padding: 12px; font-weight: 700; color: #0f172a;">${p.name}</td>
                  <td style="padding: 12px; color: #475569;">${p.category_name || 'Nhạc cụ truyền thống'}</td>
                  <td style="padding: 12px; font-weight: 700; color: #0f172a;">${formatVnd(p.price)}</td>
                  <td style="padding: 12px;">
                    <span style="padding: 2px 6px; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; border-radius: 4px;">
                      ${p.status === 'available' ? 'Đang trưng bày' : 'Lưu trữ xưởng'}
                    </span>
                  </td>
                </tr>
              `).join('');
            }
          })
          .catch(() => {});
      }

      // Hydrate recent articles
      if (articleContainer) {
        fetch('/admin/api/ducngan/articles')
          .then((r) => r.json())
          .then((articles) => {
            if (Array.isArray(articles) && articles.length > 0) {
              const top4 = articles.slice(0, 4);
              articleContainer.innerHTML = top4.map((a) => `
                <div style="padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${a.title}</div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                    ${a.category || 'Tư liệu di sản'} &bull; ${a.status === 'archive' ? 'Bản lưu trữ' : 'Đã xuất bản'}
                  </div>
                </div>
              `).join('');
            }
          })
          .catch(() => {});
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 1. TRANG SẢN PHẨM: /san-pham
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/san-pham') {
      const searchInput = document.querySelector('input[placeholder*="Tìm"]');
      const table = document.querySelector('table');
      const tbody = table ? table.querySelector('tbody') : null;
      const statBoxes = document.querySelectorAll('main section:nth-of-type(1) div[style*="background-color: #ffffff"]');
      const filterButtons = document.querySelectorAll('main section:nth-of-type(2) button');
      const footerSummary = document.querySelector('main section:nth-of-type(2) div[style*="justify-content: space-between"] > div');

      let currentProducts = [];
      let activeCategory = 'Tất cả';

      async function loadProducts() {
        try {
          const res = await fetch('/admin/api/ducngan/products');
          const products = await res.json();
          if (!Array.isArray(products)) return;

          currentProducts = products;

          // Update Stats
          if (statBoxes.length >= 4) {
            const totalBox = statBoxes[0].querySelector('div[style*="font-size: 26px"]');
            if (totalBox) totalBox.textContent = String(products.length);

            const displayBox = statBoxes[1].querySelector('div[style*="font-size: 26px"]');
            const availableCount = products.filter((p) => p.status === 'available').length;
            if (displayBox) displayBox.textContent = String(availableCount);

            const archiveBox = statBoxes[2].querySelector('div[style*="font-size: 26px"]');
            if (archiveBox) archiveBox.textContent = String(products.length - availableCount);

            const catBox = statBoxes[3].querySelector('div[style*="font-size: 26px"]');
            const catCount = new Set(products.map((p) => p.category_name).filter(Boolean)).size;
            if (catBox) catBox.textContent = String(catCount || 6);
          }

          renderProductTable();
        } catch (err) {
          console.error('Lỗi khi tải danh sách sản phẩm:', err);
        }
      }

      function renderProductTable() {
        if (!tbody) return;

        const q = (searchInput?.value || '').toLowerCase().trim();
        const filtered = currentProducts.filter((p) => {
          const matchQuery = !q || (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q)) || (p.material && p.material.toLowerCase().includes(q));
          const matchCat = activeCategory === 'Tất cả' || (p.category_name && p.category_name.includes(activeCategory));
          return matchQuery && matchCat;
        });

        if (footerSummary) {
          footerSummary.textContent = `Hiển thị 1 - ${filtered.length} của ${currentProducts.length} tác phẩm`;
        }

        if (filtered.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" style="padding: 32px; text-align: center; color: #64748b; font-size: 14px;">
                Không tìm thấy tác phẩm nào phù hợp với bộ lọc.
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = filtered.map((p) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 14px; font-weight: 600; color: #2563eb;">${p.code || 'DN-P' + String(p.id).padStart(2, '0')}</td>
            <td style="padding: 14px; font-weight: 700; color: #0f172a;">${p.name}</td>
            <td style="padding: 14px; color: #475569;">${p.category_name || 'Nhạc cụ truyền thống'}</td>
            <td style="padding: 14px; color: #475569; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.material || 'Gỗ tự nhiên nguyên khối'}</td>
            <td style="padding: 14px; font-weight: 700; color: #0f172a;">${formatVnd(p.price)}</td>
            <td style="padding: 14px;">
              ${p.status === 'available' ? `
                <span style="padding: 3px 8px; background-color: #dcfce7; color: #166534; font-weight: 700; font-size: 11px; border-radius: 4px;">
                  Đang trưng bày
                </span>
              ` : `
                <span style="padding: 3px 8px; background-color: #f1f5f9; color: #475569; font-weight: 700; font-size: 11px; border-radius: 4px;">
                  Lưu trữ xưởng
                </span>
              `}
            </td>
            <td style="padding: 14px; text-align: center;">
              <a href="/san-pham-editor?id=${p.id}" style="display: inline-block; padding: 5px 12px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 5px; font-weight: 700; text-decoration: none; font-size: 12px; margin-right: 4px;">
                Sửa
              </a>
              <button class="btn-delete-product" data-id="${p.id}" data-name="${encodeURIComponent(p.name)}" style="padding: 5px 10px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 5px; font-weight: 600; font-size: 12px; cursor: pointer;">
                Xóa
              </button>
            </td>
          </tr>
        `).join('');

        // Attach Delete listeners
        tbody.querySelectorAll('.btn-delete-product').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const name = decodeURIComponent(btn.getAttribute('data-name') || 'tác phẩm này');
            if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" không?`)) return;

            btn.disabled = true;
            btn.textContent = 'Đang xóa...';

            try {
              const res = await fetch(`/admin/api/ducngan/products/${id}`, { method: 'DELETE' });
              if (res.ok) {
                showToast(`Đã xóa thành công "${name}"`);
                await loadProducts();
              } else {
                showToast('Lỗi khi xóa tác phẩm', true);
                btn.disabled = false;
                btn.textContent = 'Xóa';
              }
            } catch (err) {
              showToast('Lỗi kết nối máy chủ', true);
              btn.disabled = false;
              btn.textContent = 'Xóa';
            }
          });
        });
      }

      // Hook search & filter
      if (searchInput) {
        searchInput.addEventListener('input', () => renderProductTable());
      }

      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          filterButtons.forEach((b) => {
            b.style.backgroundColor = '#f1f5f9';
            b.style.color = '#475569';
            b.style.border = '1px solid #e2e8f0';
          });
          btn.style.backgroundColor = '#2563eb';
          btn.style.color = '#ffffff';
          btn.style.border = 'none';

          activeCategory = btn.textContent.trim();
          renderProductTable();
        });
      });

      // Initial load
      loadProducts();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. TRANG SOẠN THẢO SẢN PHẨM: /san-pham-editor
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/san-pham-editor') {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const selectBoxes = Array.from(document.querySelectorAll('select'));
      const descTextarea = document.querySelector('textarea');
      const saveButtons = Array.from(document.querySelectorAll('a, button')).filter((el) => el.textContent.includes('Lưu tác phẩm'));

      // If editing existing product (ID present), fetch and prefill!
      if (productId) {
        const titleHeading = document.querySelector('h1');
        if (titleHeading) titleHeading.textContent = `Chỉnh sửa tác phẩm (Mã ID: ${productId})`;

        fetch(`/admin/api/ducngan/products/${productId}`)
          .then((r) => r.json())
          .then((p) => {
            if (p && !p.error) {
              if (titleHeading) titleHeading.textContent = `Chỉnh sửa tác phẩm: ${p.name}`;
              if (allInputs[0]) allInputs[0].value = p.name || '';
              if (allInputs[1]) allInputs[1].value = p.code || `DN-P${String(p.id).padStart(2, '0')}`;
              if (allInputs[2]) allInputs[2].value = p.price ? formatVnd(p.price) : 'Liên hệ nghệ nhân';
              if (allInputs[3]) allInputs[3].value = p.material || '';
              if (allInputs[4]) allInputs[4].value = p.craftsman || 'Nghệ nhân Đức Ngân';
              if (allInputs[5]) allInputs[5].value = p.wood_process || 'Gỗ hong khô tự nhiên';
              if (allInputs[6]) allInputs[6].value = p.year_crafted || '2025';

              if (descTextarea) descTextarea.value = p.description || '';

              if (selectBoxes[0] && p.category_id) {
                selectBoxes[0].value = String(p.category_id);
              }
            }
          })
          .catch(() => showToast('Không thể tải dữ liệu tác phẩm', true));
      }

      // Handle Save action
      saveButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();

          const name = allInputs[0]?.value.trim();
          if (!name) {
            alert('Vui lòng nhập tên tác phẩm nhạc cụ!');
            allInputs[0]?.focus();
            return;
          }

          const rawPrice = allInputs[2]?.value.replace(/[^0-9]/g, '') || '0';
          const payload = {
            name,
            code: allInputs[1]?.value.trim(),
            price: parseFloat(rawPrice) || 0,
            category_id: selectBoxes[0]?.value ? parseInt(selectBoxes[0].value, 10) : null,
            material: allInputs[3]?.value.trim(),
            craftsman: allInputs[4]?.value.trim(),
            wood_process: allInputs[5]?.value.trim(),
            year_crafted: parseInt(allInputs[6]?.value.trim(), 10) || 2025,
            description: descTextarea?.value.trim() || '',
            status: selectBoxes[1]?.value.includes('trưng bày') ? 'available' : 'archive',
          };

          const isUpdate = !!productId;
          const url = isUpdate ? `/admin/api/ducngan/products/${productId}` : '/admin/api/ducngan/products';
          const method = isUpdate ? 'PUT' : 'POST';

          btn.textContent = 'Đang lưu...';

          try {
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              showToast(isUpdate ? 'Đã lưu thay đổi tác phẩm thành công!' : 'Đã tạo tác phẩm mới thành công!');
              setTimeout(() => {
                window.location.href = '/san-pham';
              }, 700);
            } else {
              showToast('Lỗi khi lưu tác phẩm', true);
              btn.textContent = 'Lưu tác phẩm';
            }
          } catch (err) {
            showToast('Lỗi kết nối máy chủ', true);
            btn.textContent = 'Lưu tác phẩm';
          }
        });
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TRANG BÀI VIẾT: /bai-viet
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/bai-viet') {
      const searchInput = document.querySelector('input[placeholder*="Tìm"]');
      const table = document.querySelector('table');
      const tbody = table ? table.querySelector('tbody') : null;
      const statBoxes = document.querySelectorAll('main section:nth-of-type(1) div[style*="background-color: #ffffff"]');

      let currentArticles = [];

      async function loadArticles() {
        try {
          const res = await fetch('/admin/api/ducngan/articles');
          const articles = await res.json();
          if (!Array.isArray(articles)) return;

          currentArticles = articles;

          // Update Stats
          if (statBoxes.length >= 4) {
            const totalBox = statBoxes[0].querySelector('div[style*="font-size: 26px"]');
            if (totalBox) totalBox.textContent = String(articles.length);

            const pubBox = statBoxes[1].querySelector('div[style*="font-size: 26px"]');
            const pubCount = articles.filter((a) => a.status === 'published' || !a.status).length;
            if (pubBox) pubBox.textContent = String(pubCount);

            const draftBox = statBoxes[2].querySelector('div[style*="font-size: 26px"]');
            if (draftBox) draftBox.textContent = String(articles.length - pubCount);

            const catBox = statBoxes[3].querySelector('div[style*="font-size: 26px"]');
            const catCount = new Set(articles.map((a) => a.category).filter(Boolean)).size;
            if (catBox) catBox.textContent = String(catCount || 4);
          }

          renderArticleTable();
        } catch (err) {
          console.error('Lỗi khi tải danh sách bài viết:', err);
        }
      }

      function renderArticleTable() {
        if (!tbody) return;

        const q = (searchInput?.value || '').toLowerCase().trim();
        const filtered = currentArticles.filter((a) => {
          return !q || (a.title && a.title.toLowerCase().includes(q)) || (a.category && a.category.toLowerCase().includes(q)) || (a.author && a.author.toLowerCase().includes(q));
        });

        if (filtered.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="padding: 32px; text-align: center; color: #64748b; font-size: 14px;">
                Chưa có bài viết nào trong hệ thống. Hãy bấm "Soạn tư liệu mới" để thêm bài viết đầu tiên.
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = filtered.map((a) => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 16px 24px; font-weight: 700; color: #0f172a; max-width: 320px;">${a.title}</td>
            <td style="padding: 16px 20px; color: #64748b;">${a.category || 'Tư liệu di sản'}</td>
            <td style="padding: 16px 20px; color: #334155;">${a.author || 'Nghệ nhân Đức Ngân'}</td>
            <td style="padding: 16px 20px; color: #64748b;">${formatDate(a.published_at)}</td>
            <td style="padding: 16px 20px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700;">
                ${a.status === 'archive' ? 'Bản lưu trữ' : 'Đã xuất bản'}
              </span>
            </td>
            <td style="padding: 16px 24px; text-align: right;">
              <a href="/bai-viet-editor?id=${a.id}" style="display: inline-block; padding: 6px 12px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; font-weight: 600; color: #0f172a; text-decoration: none; margin-right: 6px;">
                Sửa
              </a>
              <button class="btn-delete-article" data-id="${a.id}" data-title="${encodeURIComponent(a.title)}" style="padding: 6px 12px; background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                Xóa
              </button>
            </td>
          </tr>
        `).join('');

        // Attach Delete listeners
        tbody.querySelectorAll('.btn-delete-article').forEach((btn) => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const title = decodeURIComponent(btn.getAttribute('data-title') || 'bài viết này');
            if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}" không?`)) return;

            btn.disabled = true;
            btn.textContent = 'Đang xóa...';

            try {
              const res = await fetch(`/admin/api/ducngan/articles/${id}`, { method: 'DELETE' });
              if (res.ok) {
                showToast(`Đã xóa bài viết "${title}"`);
                await loadArticles();
              } else {
                showToast('Lỗi khi xóa bài viết', true);
                btn.disabled = false;
                btn.textContent = 'Xóa';
              }
            } catch (err) {
              showToast('Lỗi kết nối máy chủ', true);
              btn.disabled = false;
              btn.textContent = 'Xóa';
            }
          });
        });
      }

      // Hook search input
      if (searchInput) {
        searchInput.addEventListener('input', () => renderArticleTable());
      }

      // Initial load
      loadArticles();
    }

    // ─────────────────────────────────────────────────────────────
    // 4. TRANG SOẠN THẢO BÀI VIẾT: /bai-viet-editor
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/bai-viet-editor') {
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('id');

      const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const titleInput = allInputs[0];
      const categorySelect = document.querySelector('select');
      const textareas = Array.from(document.querySelectorAll('textarea'));
      const excerptArea = textareas[0];
      const contentArea = textareas[1];
      const saveButtons = Array.from(document.querySelectorAll('a, button')).filter((el) => el.textContent.includes('Lưu bài viết'));

      // If editing existing article, fetch and prefill!
      if (articleId) {
        const titleHeading = document.querySelector('h1');
        if (titleHeading) titleHeading.textContent = `Chỉnh sửa tư liệu di sản (Mã ID: ${articleId})`;

        fetch(`/admin/api/ducngan/articles/${articleId}`)
          .then((r) => r.json())
          .then((a) => {
            if (a && !a.error) {
              if (titleHeading) titleHeading.textContent = `Chỉnh sửa: ${a.title}`;
              if (titleInput) titleInput.value = a.title || '';
              if (categorySelect && a.category) categorySelect.value = a.category;
              if (excerptArea) excerptArea.value = a.excerpt || '';
              if (contentArea) contentArea.value = a.content || '';
            }
          })
          .catch(() => showToast('Không thể tải bài viết', true));
      }

      // WYSIWYG Toolbar Actions
      if (contentArea) {
        const insertTextAtCursor = (before, after = '') => {
          const start = contentArea.selectionStart;
          const end = contentArea.selectionEnd;
          const selected = contentArea.value.substring(start, end);
          const replacement = before + selected + after;
          contentArea.setRangeText(replacement, start, end, 'end');
          contentArea.focus();
        };

        const toolbarButtons = Array.from(document.querySelectorAll('button[type="button"]'));
        toolbarButtons.forEach((btn) => {
          const txt = btn.textContent.trim();
          btn.addEventListener('click', () => {
            if (txt === 'Tiêu đề lớn') insertTextAtCursor('\n\n## ', '\n');
            else if (txt === 'Tiêu đề phụ') insertTextAtCursor('\n\n### ', '\n');
            else if (txt === 'In đậm') insertTextAtCursor('**', '**');
            else if (txt === 'In nghiêng') insertTextAtCursor('*', '*');
            else if (txt === 'Trích dẫn') insertTextAtCursor('\n> ', '\n');
            else if (txt === 'Danh sách') insertTextAtCursor('\n- ', '\n');
          });
        });
      }

      // Handle Save action
      saveButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();

          const title = titleInput?.value.trim();
          if (!title) {
            alert('Vui lòng nhập tiêu đề bài viết!');
            titleInput?.focus();
            return;
          }

          const payload = {
            title,
            category: categorySelect?.value || 'Tư liệu di sản',
            excerpt: excerptArea?.value.trim() || '',
            content: contentArea?.value.trim() || '',
            author: 'Nghệ nhân Đức Ngân',
            status: 'published',
          };

          const isUpdate = !!articleId;
          const url = isUpdate ? `/admin/api/ducngan/articles/${articleId}` : '/admin/api/ducngan/articles';
          const method = isUpdate ? 'PUT' : 'POST';

          btn.textContent = 'Đang lưu...';

          try {
            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              showToast(isUpdate ? 'Đã lưu thay đổi bài viết thành công!' : 'Đã xuất bản bài viết mới thành công!');
              setTimeout(() => {
                window.location.href = '/bai-viet';
              }, 700);
            } else {
              showToast('Lỗi khi lưu bài viết', true);
              btn.textContent = 'Lưu bài viết';
            }
          } catch (err) {
            showToast('Lỗi kết nối máy chủ', true);
            btn.textContent = 'Lưu bài viết';
          }
        });
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 5. TRANG CÀI ĐẶT: /cai-dat
    // ─────────────────────────────────────────────────────────────
    if (pathname === '/cai-dat') {
      const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const saveButtons = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.includes('Lưu'));

      // Fetch current settings on mount
      fetch('/admin/api/ducngan/settings')
        .then((r) => r.json())
        .then((s) => {
          if (s && !s.error) {
            if (allInputs[0]) allInputs[0].value = 'Hiệu Đàn Dân Tộc Đức Ngân';
            if (allInputs[1]) allInputs[1].value = s.contact_address || 'Số 12 ngõ 45 phố Hào Nam, Đống Đa, Hà Nội';
            if (allInputs[2]) allInputs[2].value = s.contact_hotline || '0903 990 020';
            if (allInputs[3]) allInputs[3].value = s.contact_working_hours || '8:00 - 20:30 từ thứ 2 đến chủ nhật';
            if (allInputs[4]) allInputs[4].value = s.contact_address_branch_2 || 'Số 18 phố Huế, Hoàn Kiếm, Hà Nội';
            if (allInputs[5]) allInputs[5].value = s.contact_email || 'ducnganmusic@gmail.com';
            if (allInputs[6]) allInputs[6].value = s.website_url || 'https://ducnganmusic.vn';
          }
        })
        .catch(() => {});

      // Hook Save buttons
      saveButtons.forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();

          const payload = {
            contact_address: allInputs[1]?.value.trim(),
            contact_hotline: allInputs[2]?.value.trim(),
            contact_working_hours: allInputs[3]?.value.trim(),
            contact_address_branch_2: allInputs[4]?.value.trim(),
            contact_email: allInputs[5]?.value.trim(),
            website_url: allInputs[6]?.value.trim(),
          };

          btn.textContent = 'Đang lưu...';

          try {
            const res = await fetch('/admin/api/ducngan/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              showToast('Đã lưu thông tin thương hiệu & showroom thành công!');
              btn.textContent = 'Đã lưu thành công';
              setTimeout(() => {
                btn.textContent = 'Lưu cài đặt';
              }, 2000);
            } else {
              showToast('Lỗi khi lưu cài đặt', true);
              btn.textContent = 'Lưu cài đặt';
            }
          } catch (err) {
            showToast('Lỗi kết nối máy chủ', true);
            btn.textContent = 'Lưu cài đặt';
          }
        });
      });
    }

  });
})();
