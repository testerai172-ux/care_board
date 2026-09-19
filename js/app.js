/**
 * app.js - Khởi tạo & Gắn sự kiện toàn hệ thống CARE BOARD
 * Hệ thống Quản trị Tài liệu Chuyên môn Chăm sóc Người bệnh
 * Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh
 */

import { storage, DEMO_USERS } from './storage.js';
import { uiRenderer } from './ui-render.js';
import { FormHandler } from './form-handler.js';
import { CouncilModal } from './council.js';
import {
  checkBackendHealth,
  getYeuCauList,
  deleteYeuCau,
  runAiReview,
  runAiReviewFile,
  uploadFile
} from './api-client.js';
import {
  exportRecordsToCsv,
  exportAuditLogToCsv,
  downloadClinicalProtocolDocx,
  downloadAiReviewReportDocx,
  downloadDossierZip
} from './download-helper.js';

class App {
  constructor() {
    this.currentView = 'danh-sach-ho-so-tien-do'; // Default active view
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.deptFilter = 'all';
    this.viewMode = 'table'; // 'table' | 'grid'
    this.userRole = 'secretary'; // 'secretary' | 'author'
    this.currentAiReview = null;
    this.uploadedAiFile = null;
  }

  init() {
    console.log('Khởi chạy hệ thống CARE BOARD - BV ĐHYD TP.HCM');

    // 1. Khởi tạo Modal Chấm điểm Hội đồng
    this.councilModal = new CouncilModal({
      showToast: (msg, icon) => this.showToast(msg, icon),
      onEvaluationSaved: () => {
        this.refreshData();
      }
    });
    this.councilModal.init();

    // 2. Khởi tạo Form 3 bước
    this.formHandler = new FormHandler({
      showToast: (msg, icon) => this.showToast(msg, icon),
      onFormSubmitted: () => {
        this.refreshData();
        this.switchView('danh-sach-ho-so-tien-do');
      }
    });
    this.formHandler.init();

    // 3. Gắn các sự kiện giao diện
    this._bindNavigation();
    this._bindFilters();
    this._bindRoleSwitcher();
    this._bindTableActions();
    this._bindGlobalActions();
    this._bindAuth();
    this._bindBackendEvents();
    this._bindDownloadActions();
    this._bindAiReview();

    // 4. Đồng bộ thông tin người dùng đang hoạt động
    this._syncCurrentUser();

    // 5. Render dữ liệu ban đầu
    this.refreshData();

    // Cài đặt view ban đầu
    this.switchView('danh-sach-ho-so-tien-do');

    // 6. Kiểm tra trạng thái đăng nhập
    if (!storage.isLoggedIn()) {
      const loginView = document.getElementById('view-login');
      if (loginView) loginView.classList.remove('hidden');
    }

    // 7. Kết nối & Kiểm tra Backend API Server (FastAPI & Supabase)
    this.checkBackendStatus(false);
    this.syncSupabaseData(false);
  }

  /**
   * Cập nhật và render lại toàn bộ giao diện
   */
  refreshData() {
    const allRecords = storage.getAll();
    const stats = storage.getStats();

    // 1. Render Metrics
    uiRenderer.renderMetrics(stats);

    // 2. Cập nhật số đếm trên filter tabs
    uiRenderer.renderFilterTabsCounts(allRecords);

    // 3. Lọc và render bảng / lưới
    const filtered = uiRenderer.filterRecords(
      allRecords,
      this.searchQuery,
      this.statusFilter,
      this.deptFilter
    );

    uiRenderer.renderTable(filtered);
    uiRenderer.renderGrid(filtered);
  }

  /**
   * Điều hướng chuyển đổi View chính
   */
  switchView(targetPath) {
    this.currentView = targetPath;

    // Danh sách 10 view container
    const views = {
      'tong-quan-dashboard': document.getElementById('view-dashboard'),
      'danh-sach-ho-so-tien-do': document.getElementById('view-list'),
      'tao-ho-so-nop-tai-lieu': document.getElementById('view-form'),
      'kho-tai-lieu': document.getElementById('view-kho-tai-lieu'),
      'ai-review-chuyen-mon': document.getElementById('view-ai-review'),
      'hoi-dong-dd-ban-hanh': document.getElementById('view-council'),
      'lich-hop-hddd': document.getElementById('view-lich-hop'),
      'tra-cuu-bao-cao': document.getElementById('view-bao-cao'),
      'nhat-ky-hoat-dong': document.getElementById('view-nhat-ky'),
      'thong-tin-ca-nhan': document.getElementById('view-ca-nhan')
    };

    // Ẩn tất cả view
    Object.values(views).forEach(v => {
      if (v) v.classList.add('hidden');
    });

    // Hiển thị view được chọn
    const activeView = views[targetPath];
    if (activeView) {
      activeView.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Cập nhật trạng thái active trên Sidebar
    const navLinks = document.querySelectorAll('aside nav a[data-path]');
    navLinks.forEach(link => {
      const path = link.getAttribute('data-path');
      const icon = link.querySelector('.material-symbols-outlined');
      if (path === targetPath) {
        link.className = 'w-full bg-white text-[#083b76] font-bold shadow-md rounded-xl px-3.5 py-2.5 flex items-center gap-3 justify-start text-left transition-all text-[13px]';
        if (icon) icon.className = 'material-symbols-outlined text-[20px] text-[#083b76]';
      } else {
        link.className = 'w-full flex items-center gap-3 justify-start text-left px-3.5 py-2.5 rounded-lg text-slate-300 hover:bg-[#083b76] hover:text-white transition-colors text-[13px] font-medium';
        if (icon) icon.className = 'material-symbols-outlined text-[20px] text-slate-400';
      }
    });

    // Nếu vào trang tạo hồ sơ mới, reset form
    if (targetPath === 'tao-ho-so-nop-tai-lieu') {
      this.formHandler.generateNewCode();
    }
  }

  /**
   * Gắn sự kiện thanh điều hướng Sidebar & Mobile Nav
   */
  _bindNavigation() {
    const navLinks = document.querySelectorAll('aside nav a[data-path], aside [data-path], [data-nav-target]');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPath = link.getAttribute('data-path') || link.getAttribute('data-nav-target');
        if (targetPath) {
          this.switchView(targetPath);
        }
      });
    });
  }

  /**
   * Gắn sự kiện bộ lọc & tìm kiếm
   */
  _bindFilters() {
    // 1. Ô tìm kiếm đa tiêu chí
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.refreshData();
      });
    }

    // Ô tìm kiếm trên Header
    const headerSearch = document.getElementById('headerSearchInput');
    if (headerSearch) {
      headerSearch.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        if (searchInput) searchInput.value = e.target.value;
        this.refreshData();
      });
    }

    // 2. Các Filter Tabs trạng thái
    const tabs = [
      { id: 'tab-all', status: 'all' },
      { id: 'tab-drafting', status: 'drafting' },
      { id: 'tab-receiving', status: 'receiving' },
      { id: 'tab-reviewing', status: 'reviewing' },
      { id: 'tab-amend', status: 'amend' },
      { id: 'tab-council', status: 'council' },
      { id: 'tab-completed', status: 'completed' },
      { id: 'tab-published', status: 'published' }
    ];

    tabs.forEach(({ id, status }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          // Reset style tất cả tabs
          tabs.forEach(t => {
            const b = document.getElementById(t.id);
            if (b) {
              b.className = 'filter-tab px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1';
            }
          });
          // Highlight tab đang chọn
          btn.className = 'filter-tab px-3 py-1.5 rounded-full bg-[#083B76] text-white text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1';
          this.statusFilter = status;
          this.refreshData();
        });
      }
    });

    // 3. Dropdown Đơn vị / Khoa phòng
    const deptSelect = document.getElementById('deptFilter');
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => {
        this.deptFilter = e.target.value;
        this.refreshData();
      });
    }

    // 4. Chuyển đổi Bảng (Table) vs Lưới (Grid)
    const btnTable = document.getElementById('btnTableView');
    const btnGrid = document.getElementById('btnGridView');
    const tableContainer = document.getElementById('tableViewContainer');
    const gridContainer = document.getElementById('gridViewContainer');

    if (btnTable && btnGrid && tableContainer && gridContainer) {
      btnTable.addEventListener('click', () => {
        this.viewMode = 'table';
        tableContainer.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        btnTable.className = 'p-1.5 rounded-lg bg-white text-[#083B76] shadow-sm';
        btnGrid.className = 'p-1.5 rounded-lg text-slate-500 hover:text-slate-800';
      });

      btnGrid.addEventListener('click', () => {
        this.viewMode = 'grid';
        tableContainer.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        gridContainer.classList.add('grid');
        btnGrid.className = 'p-1.5 rounded-lg bg-white text-[#083B76] shadow-sm';
        btnTable.className = 'p-1.5 rounded-lg text-slate-500 hover:text-slate-800';
      });
    }
  }

  /**
   * Gắn sự kiện chuyển đổi vai trò (Role Switcher)
   */
  _bindRoleSwitcher() {
    const btnSecs = document.querySelectorAll('.btn-role-secretary');
    const btnAuths = document.querySelectorAll('.btn-role-author');

    btnSecs.forEach(btn => {
      btn.addEventListener('click', () => {
        this.userRole = 'secretary';
        this._updateRoleView();
        this.showToast('Đã chuyển sang phiên tác nghiệp: Thư ký Hội đồng Điều dưỡng', 'admin_panel_settings');
      });
    });

    btnAuths.forEach(btn => {
      btn.addEventListener('click', () => {
        this.userRole = 'author';
        this._updateRoleView();
        this.showToast('Đã chuyển sang phiên tác nghiệp: Tác giả đơn vị lâm sàng', 'edit_note');
      });
    });
  }

  _updateRoleView() {
    const btnSecs = document.querySelectorAll('.btn-role-secretary');
    const btnAuths = document.querySelectorAll('.btn-role-author');

    if (this.userRole === 'secretary') {
      btnSecs.forEach(b => {
        b.className = 'btn-role-secretary px-3 py-1 rounded-md bg-[#083B76] text-white font-semibold shadow-xs text-xs';
      });
      btnAuths.forEach(b => {
        b.className = 'btn-role-author px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 font-medium transition-colors text-xs';
      });
    } else {
      btnAuths.forEach(b => {
        b.className = 'btn-role-author px-3 py-1 rounded-md bg-[#08A6A6] text-white font-semibold shadow-xs text-xs';
      });
      btnSecs.forEach(b => {
        b.className = 'btn-role-secretary px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 font-medium transition-colors text-xs';
      });
    }
  }

  /**
   * Gắn sự kiện tương tác trong bảng dữ liệu
   */
  _bindTableActions() {
    document.addEventListener('click', (e) => {
      // 1. Mở modal chấm điểm
      const councilBtn = e.target.closest('.btn-open-council');
      if (councilBtn) {
        const id = councilBtn.getAttribute('data-id');
        if (id) {
          this.councilModal.open(id);
        }
        return;
      }

      // 2. Xem chi tiết / Điều hướng sang View Hội đồng
      const detailBtn = e.target.closest('.btn-view-details');
      if (detailBtn) {
        const id = detailBtn.getAttribute('data-id');
        this.switchView('hoi-dong-dd-ban-hanh');
        this.showToast(`Đang hiển thị không gian đối chiếu hồ sơ ${id || 'QTKT-2026-001'}`, 'verified');
        return;
      }

      // 3. Xóa hồ sơ
      const deleteBtn = e.target.closest('.btn-delete-record');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (id && confirm(`Bạn có chắc chắn muốn xóa hồ sơ ${id} khỏi hệ thống và cơ sở dữ liệu không?`)) {
          // Gọi Backend API xóa trên Supabase
          deleteYeuCau(id)
            .then(res => console.log('✅ Đã xóa trên Backend API:', res))
            .catch(err => console.warn('⚠️ Lỗi khi gọi API xóa (vẫn xóa local):', err.message));

          storage.delete(id);
          this.refreshData();
          this.showToast(`Đã xóa hồ sơ ${id} khỏi hệ thống`, 'delete');
        }
        return;
      }
    });
  }

  /**
   * Gắn các nút hành động toàn cục (CTA)
   */
  _bindGlobalActions() {
    // Các nút "Tạo hồ sơ mới" ở bất cứ đâu
    const btnCreateList = document.querySelectorAll('.btn-create-new-record');
    btnCreateList.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('tao-ho-so-nop-tai-lieu');
      });
    });

    // Nút reset dữ liệu mẫu
    const btnResetData = document.getElementById('btn-reset-default-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Khôi phục toàn bộ danh sách hồ sơ về mẫu chuẩn ban đầu?')) {
          storage.resetToDefaults();
          this.refreshData();
          this.showToast('Đã khôi phục dữ liệu mẫu chuẩn thành công!', 'restore');
        }
      });
    }
  }

  /**
   * Hiển thị Toast thông báo trạng thái
   */
  showToast(message, icon = 'task_alt') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-10 opacity-0 transition-all duration-300 pointer-events-none';
      toast.innerHTML = `
        <div class="flex items-center gap-3 px-4 py-3 bg-[#002551] text-white rounded-xl shadow-xl border border-blue-400/30">
          <span class="material-symbols-outlined text-[22px] text-[#5cd9d8]" id="app-toast-icon">${icon}</span>
          <span class="text-xs font-medium" id="app-toast-text">${message}</span>
        </div>
      `;
      document.body.appendChild(toast);
    } else {
      document.getElementById('app-toast-icon').textContent = icon;
      document.getElementById('app-toast-text').textContent = message;
    }

    // Hiển thị toast
    toast.classList.remove('translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-10', 'opacity-0');
    }, 3500);
  }

  /**
   * Cuộn đến vị trí văn bản cần kiểm tra trong AI Review
   */
  focusAiDoc(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#083B76]', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#083B76]', 'ring-offset-2');
      }, 2000);
      this.showToast('Đã di chuyển đến vị trí văn bản cần kiểm tra', 'location_searching');
    }
  }

  /**
   * Áp dụng khuyến nghị sửa đổi từ AI
   */
  applyAiFix(type) {
    const scoreValEl = document.getElementById('ai-compliance-score-val');
    const scoreBarEl = document.getElementById('ai-compliance-score-bar');
    let currentScore = scoreValEl ? parseInt(scoreValEl.textContent, 10) || 88 : 88;

    if (type === 'catheter-time' || type === 'ISSUE-01') {
      const target1 = document.getElementById('target-catheter-time-1');
      const target2 = document.getElementById('target-catheter-time-2');
      if (target1) {
        target1.innerHTML = '4.2. Đặt kim và cố định bằng băng vô khuẩn: Thời gian lưu Catheter tĩnh mạch ngoại biên khuyến cáo chuẩn hóa là <strong class="text-emerald-700 underline decoration-emerald-500">96 giờ</strong> (hoặc sớm hơn khi có dấu hiệu sưng đau/viêm tĩnh mạch theo CDC 2024).';
        target1.className = 'block p-2.5 my-1 rounded bg-emerald-50 border-l-4 border-emerald-500 text-slate-800 font-medium transition-all';
      }
      if (target2) {
        target2.innerHTML = '5.1. Rút hoặc thay thế catheter ngoại biên sau <strong class="text-emerald-700 underline decoration-emerald-500">96 giờ</strong> hoạt động liên tục hoặc khi có dấu hiệu sưng đau, đỏ dọc đường đi tĩnh mạch.';
        target2.className = 'block p-2.5 my-1 rounded bg-emerald-50 border-l-4 border-emerald-500 text-slate-800 font-medium transition-all';
      }
      const card = document.getElementById('ai-card-issue-1') || document.querySelector('[data-issue-code="ISSUE-01"]');
      if (card) {
        card.classList.add('opacity-40');
      }
      currentScore = Math.min(100, currentScore + 6);
      this.showToast('Đã chuẩn hóa thời gian lưu catheter thành 96 giờ theo CDC 2024!', 'check_circle');
    } else if (type === 'appendix-code' || type === 'ISSUE-03') {
      const target = document.getElementById('target-appendix-text');
      if (target) {
        target.textContent = 'Bảng kiểm giám sát BM-01A';
        target.className = 'bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium border-b-2 border-emerald-500';
      }
      const card = document.getElementById('ai-card-issue-3') || document.querySelector('[data-issue-code="ISSUE-03"]');
      if (card) {
        card.classList.add('opacity-40');
      }
      currentScore = Math.min(100, currentScore + 4);
      this.showToast('Đã đồng bộ toàn văn mã biểu mẫu thành BM-01A!', 'check_circle');
    } else {
      const card = document.querySelector(`[data-issue-code="${type}"]`);
      if (card) card.classList.add('opacity-40');
      currentScore = Math.min(100, currentScore + 3);
      this.showToast('Đã ghi nhận và áp dụng khuyến nghị của AI!', 'check_circle');
    }

    if (scoreValEl) scoreValEl.textContent = currentScore;
    if (scoreBarEl) scoreBarEl.style.width = `${currentScore}%`;
  }

  /**
   * Thêm ghi chú của AI vào biên bản kết luận
   */
  addAiComment(text) {
    const notes = document.getElementById('ai-review-notes');
    if (notes) {
      notes.value += '\n- ' + text;
      notes.focus();
      this.showToast('Đã ghi vào kết luận phiếu soát xét chuyên môn', 'note_add');
    }
  }

  /**
   * Mở modal chấm điểm Hội đồng từ Lịch họp HĐĐD
   */
  openCouncilModal(recordCode) {
    if (this.councilModal) {
      this.councilModal.open(recordCode);
    }
  }

  /**
   * Gắn sự kiện kết xuất & Tải tệp tin thật (Real File Download Engine)
   */
  _bindDownloadActions() {
    // 1. Xuất toàn bộ danh sách hồ sơ ra file CSV / Excel
    const btnExportRecords = document.getElementById('btn-export-records');
    if (btnExportRecords) {
      btnExportRecords.addEventListener('click', () => {
        const records = storage.getAll();
        exportRecordsToCsv(records);
        this.showToast(`Đã xuất ${records.length} hồ sơ ra file CSV/Excel thành công!`, 'file_download');
      });
    }

    // 2. Tải Phác đồ toàn văn Word (.DOC) từ Hội đồng hoặc Kho tài liệu
    const btnFullDoc = document.getElementById('btn-download-full-protocol-dossier');
    if (btnFullDoc) {
      btnFullDoc.addEventListener('click', () => {
        const rec = storage.getById('QTKT-2026-001') || storage.getAll()[0];
        downloadClinicalProtocolDocx(rec, `${rec.code}_Quy_Trinh_Phac_Do_Toan_Van.doc`);
        this.showToast(`Đang tải file Word phác đồ ${rec.code} về máy!`, 'download');
      });
    }

    const btnRepoDoc = document.getElementById('btn-download-repo-protocol');
    if (btnRepoDoc) {
      btnRepoDoc.addEventListener('click', () => {
        const rec = storage.getById('QTKT-2026-001') || storage.getAll()[0];
        downloadClinicalProtocolDocx(rec, `${rec.code}_v1.1_Quy_Trinh.doc`);
        this.showToast(`Đang tải tệp ${rec.code} về máy!`, 'download');
      });
    }

    // 3. Tải trọn bộ .ZIP hồ sơ
    const btnRepoZip = document.getElementById('btn-download-repo-zip');
    if (btnRepoZip) {
      btnRepoZip.addEventListener('click', () => {
        downloadDossierZip('QTKT-2026-001');
        this.showToast('Đã đóng gói và tải trọn bộ hồ sơ .ZIP thành công!', 'folder_zip');
      });
    }

    // 4. In / Kết xuất Phiếu Soát xét Chuyên môn AI
    const btnPrintReview = document.getElementById('btn-repo-print-review');
    if (btnPrintReview) {
      btnPrintReview.addEventListener('click', () => {
        downloadAiReviewReportDocx(this.currentAiReview);
        this.showToast('Đã xuất Phiếu Thẩm duyệt Chuyên môn ra file Word (.doc)', 'description');
      });
    }

    // 5. Xuất Nhật ký Hoạt động (Audit Trail) ra CSV
    const btnExportAudit = document.getElementById('btn-export-audit-log');
    if (btnExportAudit) {
      btnExportAudit.addEventListener('click', () => {
        exportAuditLogToCsv();
        this.showToast('Đã kết xuất tệp CSV Nhật ký hoạt động & Kiểm toán!', 'download');
      });
    }

    // 6. Tra cứu & Báo cáo: Báo cáo SYT (.DOC) & Xuất Excel Tổng hợp (.CSV)
    const btnRepDoc = document.getElementById('btn-export-report-doc');
    if (btnRepDoc) {
      btnRepDoc.addEventListener('click', () => {
        const rec = storage.getAll()[0];
        downloadClinicalProtocolDocx(rec, 'Bao_cao_SYT_TPHCM_Chuan_hoa_quy_trinh_2026.doc');
        this.showToast('Đã xuất Báo cáo Sở Y tế TP.HCM ra file Word (.doc)', 'description');
      });
    }

    const btnRepExcel = document.getElementById('btn-export-report-excel');
    if (btnRepExcel) {
      btnRepExcel.addEventListener('click', () => {
        exportRecordsToCsv(storage.getAll(), 'Bao_cao_Tong_hop_142_Quy_trinh_CareBoard.csv');
        this.showToast('Đã xuất Bảng dữ liệu Excel Tổng hợp ra file CSV!', 'table_view');
      });
    }
  }

  /**
   * Gắn sự kiện AI Review Chuyên Môn Thực Tế
   */
  _bindAiReview() {
    const fileInput = document.getElementById('input-ai-upload-file');
    const triggerUploadBtn = document.getElementById('btn-trigger-ai-upload');
    const runBtn = document.getElementById('btn-run-ai-review');
    const selectDossier = document.getElementById('select-ai-dossier');
    const uploadStatus = document.getElementById('ai-upload-status');
    const btnCreateEval = document.getElementById('btn-create-eval-doc');

    // 1. Kích hoạt chọn tệp từ máy tính
    if (triggerUploadBtn && fileInput) {
      triggerUploadBtn.addEventListener('click', () => fileInput.click());
    }

    // 2. Khi người dùng chọn file thực tế
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.uploadedAiFile = file;
          const optCustom = document.getElementById('opt-custom-uploaded');
          if (optCustom) {
            optCustom.classList.remove('hidden');
            optCustom.textContent = `📁 Tệp máy tính: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            optCustom.selected = true;
          }
          if (uploadStatus) {
            uploadStatus.innerHTML = `
              <span class="material-symbols-outlined text-[16px] text-teal-300">check_circle</span>
              <span class="truncate">Đã nạp tệp: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>
            `;
          }
          this.showToast(`Đã nạp tệp "${file.name}"! Nhấn "Bắt đầu AI Soát xét" để đối chiếu.`, 'upload_file');
        }
      });
    }

    // 3. Khi thay đổi hồ sơ trong dropdown
    if (selectDossier) {
      selectDossier.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val !== 'CUSTOM_UPLOAD') {
          this.uploadedAiFile = null;
          if (uploadStatus) {
            uploadStatus.innerHTML = `
              <span class="material-symbols-outlined text-[16px] text-teal-300">check_circle</span>
              <span class="truncate">Đang chọn: ${val}</span>
            `;
          }
        }
      });
    }

    // 4. Bắt đầu AI Soát xét chuyên môn thật
    if (runBtn) {
      runBtn.addEventListener('click', async () => {
        runBtn.disabled = true;
        const originalContent = runBtn.innerHTML;
        runBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span><span>Đang rà soát CDC 2024 & TT 31...</span>';

        try {
          let reviewResult;
          if (this.uploadedAiFile) {
            const formData = new FormData();
            formData.append('file', this.uploadedAiFile);
            formData.append('code', 'UPLOAD-' + Date.now().toString().slice(-4));
            formData.append('author', storage.getCurrentUser()?.name || 'ThSĐD. Nguyễn An');
            formData.append('department', storage.getCurrentUser()?.department || 'Khoa Lâm sàng');
            formData.append('version', 'v1.0-upload');

            reviewResult = await runAiReviewFile(formData);
          } else {
            const code = selectDossier ? selectDossier.value : 'QTKT-2026-001';
            reviewResult = await runAiReview({ code });
          }

          this.currentAiReview = reviewResult;
          this._renderAiReviewResult(reviewResult);
          this.showToast(`AI Soát xét hoàn tất! Điểm tuân thủ: ${reviewResult.compliance_score}/100`, 'auto_awesome');

        } catch (err) {
          console.error('Lỗi khi chạy AI Review:', err);
          this.showToast(`Lỗi AI Review: ${err.message}`, 'error');
        } finally {
          runBtn.disabled = false;
          runBtn.innerHTML = originalContent;
        }
      });
    }

    // 5. Kết xuất Phiếu thẩm duyệt Word (.doc)
    if (btnCreateEval) {
      btnCreateEval.addEventListener('click', () => {
        downloadAiReviewReportDocx(this.currentAiReview);
        this.showToast('Đã kết xuất Phiếu Thẩm duyệt Chuyên môn AI ra file Word (.doc)!', 'assignment_turned_in');
      });
    }
  }

  /**
   * Render kết quả AI Review lên giao diện
   */
  _renderAiReviewResult(result) {
    if (!result) return;

    // 1. Header metadata
    const docCode = document.getElementById('ai-review-doc-code');
    const docVer = document.getElementById('ai-review-doc-version');
    const docTitle = document.getElementById('ai-review-doc-title');
    const docAuthor = document.getElementById('ai-review-doc-author');
    if (docCode) docCode.textContent = result.dossier_code || 'QTKT-2026-001';
    if (docVer) docVer.textContent = 'Phiên bản ' + (result.version || 'v1.1');
    if (docTitle) docTitle.textContent = result.title || '';
    if (docAuthor) docAuthor.textContent = 'Tác giả: ' + (result.author || 'Cán bộ Y tế');

    // 2. Score & Metrics
    const scoreVal = document.getElementById('ai-compliance-score-val');
    const scoreBar = document.getElementById('ai-compliance-score-bar');
    const bytBadge = document.getElementById('ai-byt-passed-badge');
    const issuesBadge = document.getElementById('ai-issues-count-badge');
    const criticalBadge = document.getElementById('ai-critical-count-badge');
    const issuesHeader = document.getElementById('ai-issues-count-header');

    if (scoreVal) scoreVal.textContent = result.compliance_score || 88;
    if (scoreBar) scoreBar.style.width = `${result.compliance_score || 88}%`;
    if (bytBadge) {
      bytBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">check_circle</span> ${result.byt_structure_passed ? '8/8 Đạt' : 'Chưa đủ cấu phần'}`;
    }
    if (issuesBadge) {
      issuesBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">warning</span> ${result.issues_count || 0} Điểm`;
    }
    if (criticalBadge) {
      criticalBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">error</span> ${result.critical_count || 0} Critical`;
    }
    if (issuesHeader) {
      issuesHeader.textContent = `Vấn đề phát hiện (${result.issues_count || 0})`;
    }

    // 3. Render danh sách Issue Cards
    const issuesList = document.getElementById('ai-issues-list');
    if (issuesList && Array.isArray(result.issues)) {
      issuesList.innerHTML = result.issues.map(iss => {
        const isCrit = iss.severity === 'critical';
        const borderColor = isCrit ? 'border-l-red-500' : 'border-l-amber-500';
        const badgeBg = isCrit ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800';
        const iconName = isCrit ? 'gpp_bad' : (iss.severity === 'warning' ? 'warning' : 'info');
        const badgeText = isCrit ? 'Critical' : 'Cảnh báo';

        return `
          <div class="p-4 rounded-xl bg-white shadow-sm flex flex-col gap-2.5 border-l-4 ${borderColor} border border-slate-200 transition-all" data-issue-code="${iss.code}">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded ${badgeBg} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">${iconName}</span> ${badgeText}
                </span>
                <span class="text-xs font-bold text-slate-800">${iss.title}</span>
              </div>
              <span class="text-[11px] text-slate-400 font-medium font-mono">${iss.section || 'Mục'}</span>
            </div>
            <p class="text-xs text-slate-700 leading-snug">${iss.description}</p>
            <div class="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <button class="text-xs text-[#083B76] font-semibold hover:underline flex items-center gap-1 cursor-pointer" onclick="window._careBoardApp?.focusAiDoc('${iss.target_element_id}')" type="button">
                <span class="material-symbols-outlined text-[14px]">visibility</span>Xem vị trí
              </button>
              <div class="flex items-center gap-2">
                <button class="px-2.5 py-1 rounded text-xs text-slate-500 hover:bg-slate-100 font-medium transition-colors cursor-pointer" onclick="this.closest('[data-issue-code]').classList.add('opacity-40'); window._careBoardApp?.showToast('Đã bỏ qua cảnh báo ${iss.code}');" type="button">Bỏ qua</button>
                <button class="px-3 py-1 rounded-lg bg-[#083B76] text-white text-xs font-semibold hover:bg-[#002551] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer" onclick="window._careBoardApp?.applyAiFix('${iss.fix_type || iss.code}')" type="button">
                  <span class="material-symbols-outlined text-[13px]">check</span>Chấp nhận
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 4. Render Document Viewer with highlights
    const docViewer = document.getElementById('ai-document-viewer');
    if (docViewer && result.annotated_html) {
      docViewer.innerHTML = result.annotated_html;
    }

    // 5. Render Secretary Conclusion
    const reviewNotes = document.getElementById('ai-review-notes');
    if (reviewNotes && result.secretary_conclusion) {
      reviewNotes.value = result.secretary_conclusion;
    }
  }

  /**
   * Đồng bộ thông tin người dùng lên các thành phần giao diện
   */
  _syncCurrentUser() {
    const user = storage.getCurrentUser();
    if (!user) {
      const modalUserName = document.getElementById('logout-modal-user-name');
      if (modalUserName) modalUserName.textContent = 'Người dùng';
      return;
    }

    // 1. Cập nhật Sidebar
    const sideName = document.getElementById('sidebar-user-name');
    const sideRole = document.getElementById('sidebar-user-role');
    const sideDept = document.getElementById('sidebar-user-dept');
    if (sideName) sideName.textContent = user.name;
    if (sideRole) sideRole.textContent = user.position;
    if (sideDept) sideDept.textContent = user.department;

    // 2. Cập nhật Header
    const headName = document.getElementById('header-user-name');
    const headRole = document.getElementById('header-user-role');
    if (headName) headName.textContent = user.name;
    if (headRole) headRole.textContent = user.position;

    // 3. Cập nhật Dashboard Banner
    const dashGreeting = document.getElementById('dashboard-user-greeting');
    const dashSubtext = document.getElementById('dashboard-user-subtext');
    if (dashGreeting) dashGreeting.textContent = `Chào buổi sáng, ${user.name}`;
    if (dashSubtext) {
      dashSubtext.textContent = `Hệ thống đang mở phiên tác nghiệp cho ${user.name} (${user.position}). Đơn vị: ${user.department}.`;
    }

    // 4. Cập nhật Trang Thông tin cá nhân
    const profName = document.getElementById('profile-user-name');
    const profId = document.getElementById('profile-user-id');
    const profTitle = document.getElementById('profile-user-title');
    const profPos = document.getElementById('profile-user-position');
    const profDept = document.getElementById('profile-user-dept');
    const profEmail = document.getElementById('profile-user-email');
    const profPhone = document.getElementById('profile-user-phone');
    const profRls = document.getElementById('profile-user-rls-title');

    if (profName) profName.textContent = user.name;
    if (profId) profId.textContent = user.id;
    if (profTitle) profTitle.textContent = user.title || 'Cán bộ Y tế';
    if (profPos) profPos.textContent = user.fullPosition || user.position;
    if (profDept) profDept.textContent = user.department;
    if (profEmail) profEmail.textContent = user.email;
    if (profPhone) profPhone.textContent = user.phone || 'Ext. 1080';
    if (profRls) profRls.textContent = user.fullPosition || user.position;

    // 5. Cập nhật Modal Đăng xuất
    const logoutUserName = document.getElementById('logout-modal-user-name');
    if (logoutUserName) logoutUserName.textContent = user.name;

    // 6. Đồng bộ vai trò hệ thống (Role Switcher)
    if (user.role) {
      this.userRole = user.role;
      this._updateRoleView();
    }
  }

  /**
   * Gắn sự kiện Đăng nhập, Đăng xuất & Tài khoản Demo
   */
  _bindAuth() {
    const loginView = document.getElementById('view-login');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errAlert = document.getElementById('login-error-alert');
    const errText = document.getElementById('login-error-text');

    // 1. Submit Form Đăng nhập
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';

        const result = storage.login(email, password);
        if (result.success) {
          if (errAlert) errAlert.classList.add('hidden');
          if (loginView) loginView.classList.add('hidden');
          this._syncCurrentUser();
          this.showToast(`Chào mừng ${result.user.name} đã đăng nhập thành công!`, 'verified_user');
        } else {
          if (errAlert && errText) {
            errText.textContent = result.message || 'Thông tin đăng nhập không hợp lệ.';
            errAlert.classList.remove('hidden');
          }
        }
      });
    }

    // 2. Click Chọn tài khoản Demo (1-Click)
    const demoButtons = document.querySelectorAll('.btn-demo-account');
    demoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const pass = btn.getAttribute('data-password') || 'Hospital@2026Secure';
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = pass;

        // Hiệu ứng visual
        if (emailInput) {
          emailInput.classList.add('ring-2', 'ring-[#08A6A6]');
          setTimeout(() => emailInput.classList.remove('ring-2', 'ring-[#08A6A6]'), 600);
        }

        const result = storage.login(email, pass);
        if (result.success) {
          if (errAlert) errAlert.classList.add('hidden');
          if (loginView) loginView.classList.add('hidden');
          this._syncCurrentUser();
          this.showToast(`Đã đăng nhập: ${result.user.name} (${result.user.position})`, 'check_circle');
        }
      });
    });

    // 3. Ẩn / hiện mật khẩu
    const btnTogglePass = document.getElementById('btn-toggle-login-password');
    const eyeIcon = document.getElementById('login-eye-icon');
    if (btnTogglePass && passwordInput) {
      btnTogglePass.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          if (eyeIcon) eyeIcon.textContent = 'visibility_off';
        } else {
          passwordInput.type = 'password';
          if (eyeIcon) eyeIcon.textContent = 'visibility';
        }
      });
    }

    // 4. Khám phá nhanh (Chế độ xem khách)
    const btnGuest = document.getElementById('btn-login-guest');
    if (btnGuest) {
      btnGuest.addEventListener('click', () => {
        storage.setCurrentUser(DEMO_USERS[0]);
        if (errAlert) errAlert.classList.add('hidden');
        if (loginView) loginView.classList.add('hidden');
        this._syncCurrentUser();
        this.showToast('Đang xem hệ thống ở chế độ Thư ký HĐĐD (Khách)', 'visibility');
      });
    }

    // 5. Mở màn hình đăng nhập từ Sidebar nav
    const openLoginTriggers = document.querySelectorAll('[data-action="open-login"]');
    openLoginTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginView) loginView.classList.remove('hidden');
      });
    });

    // 6. Mở Modal Đăng xuất
    const logoutModal = document.getElementById('logout-modal');
    const logoutTriggers = [
      document.getElementById('sidebar-btn-logout'),
      document.getElementById('header-btn-logout'),
      document.getElementById('profile-btn-logout'),
      document.getElementById('profile-header-btn-logout')
    ];

    logoutTriggers.forEach(trigger => {
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const user = storage.getCurrentUser();
          const modalUserName = document.getElementById('logout-modal-user-name');
          if (modalUserName) {
            modalUserName.textContent = user ? user.name : 'Người dùng';
          }
          if (logoutModal) logoutModal.classList.remove('hidden');
        });
      }
    });

    // Hủy đăng xuất
    const cancelLogoutButtons = document.querySelectorAll('.btn-close-logout-modal, #btn-cancel-logout');
    cancelLogoutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (logoutModal) logoutModal.classList.add('hidden');
      });
    });

    // Xác nhận đăng xuất
    const btnConfirmLogout = document.getElementById('btn-confirm-logout');
    if (btnConfirmLogout) {
      btnConfirmLogout.addEventListener('click', () => {
        if (logoutModal) logoutModal.classList.add('hidden');
        storage.logout();
        if (loginView) loginView.classList.remove('hidden');
        this.showToast('Đã kết thúc phiên làm việc an toàn', 'logout');
      });
    }
  }

  /**
   * Kiểm tra tình trạng kết nối tới Backend API & Database Supabase
   */
  async checkBackendStatus(showToastOnSuccess = false) {
    const badge = document.getElementById('header-backend-badge');
    const dot = document.getElementById('header-backend-dot');
    const text = document.getElementById('header-backend-text');

    try {
      const health = await checkBackendHealth();
      if (health && health.service && health.database?.status === 'connected') {
        const latency = health.database.latency_ms || 120;
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
        if (text) text.textContent = `Supabase Cloud & FastAPI (${latency}ms)`;
        if (badge) {
          badge.className = 'hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 cursor-pointer transition-all hover:bg-emerald-100';
          badge.title = `Backend API: Online (Port 5000) | Database: Connected | Độ trễ: ${latency}ms`;
        }
        if (showToastOnSuccess) {
          this.showToast(`Backend API & Supabase kết nối tốt! Độ trễ: ${latency}ms`, 'cloud_done');
        }
      } else if (health && health.service) {
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-teal-500 animate-pulse';
        if (text) text.textContent = 'Backend FastAPI: Online (Port 5000)';
        if (showToastOnSuccess) {
          this.showToast('Backend FastAPI đang hoạt động trên Port 5000', 'cloud_queue');
        }
      } else {
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-500';
        if (text) text.textContent = 'Backend: Offline (Chế độ cục bộ)';
      }
    } catch (e) {
      if (dot) dot.className = 'w-2 h-2 rounded-full bg-amber-500';
      if (text) text.textContent = 'Backend: Offline (Chế độ cục bộ)';
    }
  }

  /**
   * Đồng bộ dữ liệu yêu cầu chuyên môn từ Database Supabase qua Backend API
   */
  async syncSupabaseData(showNotification = true) {
    const syncBtn = document.getElementById('btn-sync-supabase');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Đang đồng bộ...</span>';
    }

    try {
      const res = await getYeuCauList({ limit: 50 });
      let newCount = 0;

      if (res && res.data && Array.isArray(res.data)) {
        res.data.forEach(item => {
          const added = storage.mergeBackendRecord(item);
          if (added) newCount++;
        });

        // Làm mới dữ liệu hiển thị trên bảng, lưới và metrics
        this.refreshData();

        if (showNotification) {
          if (newCount > 0) {
            this.showToast(`Đã đồng bộ thành công ${newCount} hồ sơ mới từ Supabase!`, 'cloud_download');
          } else {
            this.showToast(`Dữ liệu đã khớp mới nhất với Supabase Cloud (${res.data.length} bản ghi)`, 'cloud_done');
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi khi đồng bộ từ Backend API:', err);
      if (showNotification) {
        this.showToast(`Không thể đồng bộ: ${err.message}`, 'cloud_off');
      }
    } finally {
      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">cloud_sync</span><span>Đồng bộ Supabase</span>';
      }
    }
  }

  /**
   * Gắn sự kiện kết nối Backend API & nút Đồng bộ Supabase
   */
  _bindBackendEvents() {
    // Click vào Header Status Badge -> Kiểm tra lại kết nối và hiển thị toast
    const badge = document.getElementById('header-backend-badge');
    if (badge) {
      badge.addEventListener('click', () => {
        this.checkBackendStatus(true);
      });
    }

    // Click vào nút "Đồng bộ Supabase" ở thanh công cụ danh sách hồ sơ
    const syncBtn = document.getElementById('btn-sync-supabase');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        this.syncSupabaseData(true);
      });
    }
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window._careBoardApp = app; // Hỗ trợ debug nếu cần
});
