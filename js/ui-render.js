/**
 * ui-render.js - Render Thống kê, Bảng hồ sơ (Table/Grid) và Bộ lọc
 * Hệ thống Quản trị Tài liệu Chuyên môn Chăm sóc Người bệnh (CARE BOARD)
 * Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh
 */

export const STEP_NAMES = [
  '1. Soạn thảo',
  '2. Tiếp nhận chuyên môn',
  '3. Sơ duyệt HĐĐD',
  '4. Phiên họp HĐĐD',
  '5. Hoàn thiện góp ý',
  '6. Ban hành Quyết định'
];

export class UIRenderer {
  constructor() {
    this.tableBody = document.querySelector('#tableViewContainer tbody');
    this.gridContainer = document.getElementById('gridViewContainer');
  }

  /**
   * Render các thẻ chỉ số thống kê trên Dashboard và trang Danh sách
   */
  renderMetrics(stats) {
    // Metric badges trên trang Danh sách
    const totalEl = document.getElementById('metric-total');
    const needFeedbackEl = document.getElementById('metric-need-feedback');
    const publishedEl = document.getElementById('metric-published');

    if (totalEl) totalEl.textContent = stats.total;
    if (needFeedbackEl) needFeedbackEl.textContent = stats.needFeedback;
    if (publishedEl) publishedEl.textContent = stats.published;

    // Metric cards trên Dashboard
    const dashTotal = document.getElementById('dash-metric-total');
    const dashReviewing = document.getElementById('dash-metric-reviewing');
    const dashCouncil = document.getElementById('dash-metric-council');
    const dashCompleted = document.getElementById('dash-metric-completed');
    const dashPublished = document.getElementById('dash-metric-published');

    if (dashTotal) dashTotal.textContent = stats.total;
    if (dashReviewing) dashReviewing.textContent = String(stats.reviewing).padStart(2, '0');
    if (dashCouncil) dashCouncil.textContent = String(stats.inCouncil).padStart(2, '0');
    if (dashCompleted) dashCompleted.textContent = String(stats.completed).padStart(2, '0');
    if (dashPublished) dashPublished.textContent = String(stats.published).padStart(2, '0');

    // Cập nhật số đếm trên 6 giai đoạn tiến trình Dashboard
    const stageCounts = [
      stats.drafting || 1,
      stats.reviewing || 2,
      stats.needFeedback || 3,
      stats.inCouncil || 2,
      stats.completed || 2,
      stats.published || 4
    ];
    for (let i = 1; i <= 6; i++) {
      const stageEl = document.getElementById(`dash-stage-count-${i}`);
      if (stageEl) {
        stageEl.textContent = `${String(stageCounts[i - 1]).padStart(2, '0')} HS`;
      }
    }
  }

  /**
   * Render chuỗi 6 bước tiến trình mini (Mini Pipeline Stepper)
   */
  renderMiniPipeline(currentStep, status) {
    let html = '<div class="flex items-center gap-1">';
    for (let i = 1; i <= 6; i++) {
      if (i < currentStep) {
        // Đã hoàn thành
        html += `<span class="w-6 h-6 rounded-full bg-[#006a6a] text-white flex items-center justify-center text-[11px] font-bold" title="Bước ${i} (Đã xong)">✓</span>`;
        if (i < 6) html += '<span class="w-2.5 h-0.5 bg-[#006a6a]"></span>';
      } else if (i === currentStep) {
        // Bước hiện tại
        if (status === 'Cần bổ sung') {
          html += `<span class="w-6 h-6 rounded-full bg-[#f38d29] text-white flex items-center justify-center text-[11px] font-bold animate-pulse shadow-xs" title="Bước ${i}: Cần bổ sung">${i}</span>`;
        } else if (status === 'Đã ban hành') {
          html += `<span class="w-6 h-6 rounded-full bg-[#083b76] text-white flex items-center justify-center text-[11px] font-bold" title="Bước ${i}: Ban hành">★</span>`;
        } else {
          html += `<span class="w-6 h-6 rounded-full bg-[#083b76] text-white flex items-center justify-center text-[11px] font-bold shadow-xs" title="Bước ${i}: Đang xử lý">${i}</span>`;
        }
        if (i < 6) html += '<span class="w-2.5 h-0.5 bg-slate-200"></span>';
      } else {
        // Chưa tới
        html += `<span class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[11px]" title="Bước ${i}">${i}</span>`;
        if (i < 6) html += '<span class="w-2.5 h-0.5 bg-slate-200"></span>';
      }
    }
    html += '</div>';

    // Nhãn phụ bên dưới
    let stepLabel = `B${currentStep}: ${STEP_NAMES[currentStep - 1] || ''}`;
    let labelColor = 'text-slate-600';
    if (status === 'Cần bổ sung') labelColor = 'text-[#d97312] font-semibold';
    if (status === 'Đã ban hành') labelColor = 'text-[#006a6a] font-semibold';
    if (status === 'Chờ HĐĐD') labelColor = 'text-[#083b76] font-semibold';

    html += `<span class="text-[11px] ${labelColor} mt-1">${stepLabel}</span>`;
    return html;
  }

  /**
   * Render huy hiệu trạng thái và thời hạn SLA
   */
  renderStatusBadge(status, deadline) {
    let badgeClass = 'bg-slate-100 text-slate-700';
    let dotClass = 'bg-slate-400';

    if (status === 'Cần bổ sung') {
      badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200';
      dotClass = 'bg-[#f38d29]';
    } else if (status === 'Đã ban hành') {
      badgeClass = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      dotClass = 'bg-emerald-500';
    } else if (status === 'Chờ HĐĐD') {
      badgeClass = 'bg-blue-50 text-[#083b76] border border-blue-200 font-semibold';
      dotClass = 'bg-[#083b76]';
    } else if (status === 'Đang soát xét') {
      badgeClass = 'bg-teal-50 text-teal-800 border border-teal-200';
      dotClass = 'bg-teal-500';
    } else if (status === 'Đã hoàn chỉnh') {
      badgeClass = 'bg-cyan-50 text-cyan-800 border border-cyan-200';
      dotClass = 'bg-cyan-600';
    }

    let deadlineHtml = '';
    if (deadline) {
      const isUrgent = deadline.includes('Trễ') || deadline.includes('2 ngày') || deadline.includes('Gấp');
      const textClass = isUrgent ? 'text-rose-600 font-bold' : 'text-slate-500 font-medium';
      deadlineHtml = `
        <div class="flex items-center gap-1 text-[11px] ${textClass} mt-0.5">
          <span class="material-symbols-outlined text-[13px]">hourglass_bottom</span>
          <span>${deadline}</span>
        </div>
      `;
    }

    return `
      <div class="flex flex-col items-start gap-0.5">
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${badgeClass}">
          <span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>
          ${status}
        </span>
        ${deadlineHtml}
      </div>
    `;
  }

  /**
   * Render danh sách hồ sơ dạng Bảng chi tiết (Table View)
   */
  renderTable(records) {
    if (!this.tableBody) {
      this.tableBody = document.querySelector('#tableViewContainer tbody');
    }
    if (!this.tableBody) return;

    if (records.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-12 text-slate-400">
            <span class="material-symbols-outlined text-[48px] block mb-2 text-slate-300">search_off</span>
            <p class="text-sm font-semibold">Không tìm thấy hồ sơ phù hợp</p>
            <p class="text-xs text-slate-400 mt-0.5">Vui lòng thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm.</p>
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = records.map(record => {
      const typeBadgeColor = record.type === 'QTKT' ? 'bg-blue-50 text-[#083b76] border border-blue-200' :
                             record.type === 'HDCS' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                             record.type === 'QĐCK' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                             'bg-slate-100 text-slate-700';

      const avatarLetter = (record.author || 'BS').charAt(0);
      const councilScoreBadge = record.councilScore ? `
        <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" title="Điểm HĐĐD: ${record.councilScore.total}/100">
          <span class="material-symbols-outlined text-[12px]">gavel</span> ${record.councilScore.total}đ
        </span>
      ` : '';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100 group" data-id="${record.id}">
          <!-- Cột 1: Mã Hồ Sơ -->
          <td class="py-3.5 px-4 align-top">
            <div class="flex flex-col gap-0.5">
              <button class="btn-view-details text-left font-bold text-xs text-[#083B76] hover:underline flex items-center gap-1" data-id="${record.id}" type="button">
                <span>${record.code}</span>
                <span class="material-symbols-outlined text-[14px] text-blue-400">open_in_new</span>
              </button>
              <span class="text-[10px] text-slate-400">Khởi tạo: ${record.dateCreated || '2026'}</span>
              ${councilScoreBadge}
            </div>
          </td>

          <!-- Cột 2: Tên Tài Liệu -->
          <td class="py-3.5 px-4 align-top max-w-xs">
            <div class="font-semibold text-xs text-slate-900 group-hover:text-[#083B76] transition-colors leading-snug">
              ${record.title}
            </div>
            <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title="${record.desc || ''}">
              ${record.desc || ''}
            </div>
          </td>

          <!-- Cột 3: Loại & Phiên bản -->
          <td class="py-3.5 px-4 align-top whitespace-nowrap">
            <div class="flex flex-col items-start gap-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${typeBadgeColor}">${record.type}</span>
              <span class="text-[11px] font-semibold text-[#083B76]">${record.version || 'v1.0'}</span>
            </div>
          </td>

          <!-- Cột 4: Đơn vị / Tác giả -->
          <td class="py-3.5 px-4 align-top">
            <div class="flex items-center gap-2">
              <img src="assets/avatar.png" alt="Avatar" class="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs shrink-0">
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-slate-800 truncate">${record.author}</span>
                <span class="text-[11px] text-slate-500 truncate">${record.department}</span>
              </div>
            </div>
          </td>

          <!-- Cột 5: Tiến trình 6 Bước -->
          <td class="py-3.5 px-4 align-top text-center min-w-[190px]">
            <div class="flex flex-col items-center">
              ${this.renderMiniPipeline(record.currentStep, record.status)}
            </div>
          </td>

          <!-- Cột 6: Trạng thái & Hạn xử lý -->
          <td class="py-3.5 px-4 align-top whitespace-nowrap">
            ${this.renderStatusBadge(record.status, record.deadline)}
          </td>

          <!-- Cột 7: File S3 -->
          <td class="py-3.5 px-4 align-top">
            <div class="flex flex-col gap-0.5">
              <span class="text-[11px] text-slate-700 flex items-center gap-1 font-mono">
                <span class="material-symbols-outlined text-[15px] text-[#08A6A6]">cloud_done</span>
                <span class="truncate max-w-[130px]" title="${record.file || ''}">${record.file || 'tai_lieu.docx'}</span>
              </span>
              <span class="text-[10px] text-slate-400">${record.fileSize || '2.5 MB'} • S3 Synced</span>
            </div>
          </td>

          <!-- Cột 8: Thao tác nhanh -->
          <td class="py-3.5 px-4 align-top text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-1">
              <button class="btn-open-council p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#083B76] transition-colors" title="Chấm điểm & Thẩm định HĐĐD" data-id="${record.id}" type="button">
                <span class="material-symbols-outlined text-[17px]">gavel</span>
              </button>
              <button class="btn-view-details p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Xem chi tiết hồ sơ" data-id="${record.id}" type="button">
                <span class="material-symbols-outlined text-[17px]">visibility</span>
              </button>
              <button class="btn-delete-record p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Xóa hồ sơ" data-id="${record.id}" type="button">
                <span class="material-symbols-outlined text-[17px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Render danh sách hồ sơ dạng Lưới (Grid View)
   */
  renderGrid(records) {
    if (!this.gridContainer) {
      this.gridContainer = document.getElementById('gridViewContainer');
    }
    if (!this.gridContainer) return;

    if (records.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <span class="material-symbols-outlined text-[48px] block mb-2 text-slate-300">search_off</span>
          <p class="text-sm font-semibold">Không tìm thấy hồ sơ phù hợp</p>
        </div>
      `;
      return;
    }

    this.gridContainer.innerHTML = records.map(record => {
      const progressPercent = Math.round((record.currentStep / 6) * 100);
      const councilText = record.councilScore ? `Điểm HĐĐD: ${record.councilScore.total}/100` : 'Chưa chấm điểm';

      return `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between" data-id="${record.id}">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#083B76] border border-blue-200">
                ${record.code}
              </span>
              <span class="text-[11px] font-semibold text-slate-500">${record.version || 'v1.0'}</span>
            </div>
            <h4 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#083B76] cursor-pointer btn-view-details" data-id="${record.id}">
              ${record.title}
            </h4>
            <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">${record.desc || ''}</p>
            
            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <div class="flex items-center gap-1.5 min-w-0">
                <img src="assets/avatar.png" alt="Avatar" class="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0">
                <span class="truncate max-w-[140px] font-medium">${record.author}</span>
              </div>
              <span class="text-slate-400 text-[10px] truncate max-w-[110px]">${record.department}</span>
            </div>

            <!-- Thanh tiến trình 6 bước -->
            <div class="mt-3">
              <div class="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Tiến trình: Bước ${record.currentStep}/6</span>
                <span class="font-bold text-[#083B76]">${progressPercent}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#08A6A6] rounded-full transition-all" style="width: ${progressPercent}%"></div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] text-slate-500 font-medium">${councilText}</span>
            <div class="flex items-center gap-1">
              <button class="btn-open-council px-2 py-1 rounded bg-[#083B76] text-white text-[11px] font-semibold hover:bg-[#002551] flex items-center gap-1 transition-colors shadow-xs" data-id="${record.id}" type="button">
                <span class="material-symbols-outlined text-[13px]">gavel</span> Chấm điểm
              </button>
              <button class="btn-view-details px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors" data-id="${record.id}" type="button">
                Chi tiết
              </button>
              <button class="btn-delete-record p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition-colors" title="Xóa hồ sơ" data-id="${record.id}" type="button">
                <span class="material-symbols-outlined text-[15px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Cập nhật số đếm trên các Filter Tabs trạng thái
   */
  renderFilterTabsCounts(records) {
    const counts = {
      all: records.length,
      drafting: records.filter(r => r.status === 'Đang soạn thảo' || r.currentStep === 1).length,
      receiving: records.filter(r => r.status === 'Chờ tiếp nhận' || r.currentStep === 2).length,
      reviewing: records.filter(r => r.status === 'Đang soát xét').length,
      amend: records.filter(r => r.status === 'Cần bổ sung' || r.currentStep === 3).length,
      council: records.filter(r => r.status === 'Chờ HĐĐD' || r.currentStep === 4).length,
      completed: records.filter(r => r.status === 'Đã hoàn chỉnh' || r.currentStep === 5).length,
      published: records.filter(r => r.status === 'Đã ban hành' || r.currentStep === 6).length
    };

    const tabMap = {
      'tab-all': `Tất cả (${counts.all})`,
      'tab-drafting': `Đang soạn thảo (${counts.drafting})`,
      'tab-receiving': `Chờ tiếp nhận (${counts.receiving})`,
      'tab-reviewing': `Đang soát xét (${counts.reviewing})`,
      'tab-amend': `Cần bổ sung (${counts.amend})`,
      'tab-council': `Chờ HĐĐD (${counts.council})`,
      'tab-completed': `Đã hoàn chỉnh (${counts.completed})`,
      'tab-published': `Đã ban hành (${counts.published})`
    };

    for (const [id, text] of Object.entries(tabMap)) {
      const tabEl = document.getElementById(id);
      if (tabEl) {
        if (id === 'tab-amend') {
          tabEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> ${text}`;
        } else {
          tabEl.textContent = text;
        }
      }
    }
  }

  /**
   * Lọc danh sách hồ sơ theo bộ lọc
   */
  filterRecords(records, query = '', statusFilter = 'all', departmentFilter = 'all') {
    let filtered = [...records];

    // Lọc theo từ khóa tìm kiếm
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(r => 
        (r.code && r.code.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.author && r.author.toLowerCase().includes(q)) ||
        (r.department && r.department.toLowerCase().includes(q)) ||
        (r.desc && r.desc.toLowerCase().includes(q)) ||
        (r.type && r.type.toLowerCase().includes(q))
      );
    }

    // Lọc theo Tab trạng thái
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'drafting') {
        filtered = filtered.filter(r => r.status === 'Đang soạn thảo' || r.currentStep === 1);
      } else if (statusFilter === 'receiving') {
        filtered = filtered.filter(r => r.status === 'Chờ tiếp nhận' || r.currentStep === 2);
      } else if (statusFilter === 'reviewing') {
        filtered = filtered.filter(r => r.status === 'Đang soát xét');
      } else if (statusFilter === 'amend') {
        filtered = filtered.filter(r => r.status === 'Cần bổ sung' || r.currentStep === 3);
      } else if (statusFilter === 'council') {
        filtered = filtered.filter(r => r.status === 'Chờ HĐĐD' || r.currentStep === 4);
      } else if (statusFilter === 'completed') {
        filtered = filtered.filter(r => r.status === 'Đã hoàn chỉnh' || r.currentStep === 5);
      } else if (statusFilter === 'published') {
        filtered = filtered.filter(r => r.status === 'Đã ban hành' || r.currentStep === 6);
      }
    }

    // Lọc theo Đơn vị / Khoa phòng
    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (departmentFilter === 'icu') return r.departmentKey === 'icu' || r.department.includes('Hồi sức') || r.department.includes('Cấp cứu');
        if (departmentFilter === 'thoracic') return r.departmentKey === 'thoracic' || r.department.includes('Tiêu hóa') || r.department.includes('Ngoại');
        if (departmentFilter === 'nursing') return r.departmentKey === 'nursing' || r.department.includes('Điều dưỡng');
        if (departmentFilter === 'infection') return r.departmentKey === 'infection' || r.department.includes('Kiểm soát nhiễm khuẩn');
        return true;
      });
    }

    return filtered;
  }
}

export const uiRenderer = new UIRenderer();
