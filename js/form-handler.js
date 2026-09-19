/**
 * form-handler.js - Xử lý Form 3 Bước Tạo hồ sơ & Nộp tài liệu
 * Hệ thống Quản trị Tài liệu Chuyên môn Chăm sóc Người bệnh (CARE BOARD)
 * Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh
 */

import { storage } from './storage.js';
import { createYeuCau } from './api-client.js';

export class FormHandler {
  constructor(options = {}) {
    this.currentStep = 1;
    this.formData = {
      code: '',
      expectedDate: '',
      title: '',
      type: 'QTKT',
      typeName: 'Quy trình kỹ thuật điều dưỡng (QTKT)',
      priority: 'Thường',
      department: 'Khoa Điều dưỡng',
      departmentKey: 'nursing',
      author: 'ThSĐD. Nguyễn An',
      collaborators: ['Khoa Kiểm soát nhiễm khuẩn', 'Khoa Dược Bệnh viện', 'Phòng Quản lý Chất lượng'],
      legalBasis: 'Căn cứ Thông tư 31/2021/TT-BYT quy định hoạt động điều dưỡng trong bệnh viện.',
      fileMain: 'QTKT-2026-010_ThietLapQuyTrinh_v1.docx',
      fileSize: '2.4 MB',
      refFiles: [
        { name: 'Guideline_CDC_Vascular_Access_2024.pdf', size: '4.1 MB', note: 'Khuyến cáo quốc tế' },
        { name: 'Tieu_chuan_INS_Standards_2024.docx', size: '1.8 MB', note: 'Tài liệu chứng cứ' }
      ],
      m01Signed: true
    };

    this.onFormSubmitted = options.onFormSubmitted || (() => {});
    this.showToast = options.showToast || ((msg) => alert(msg));
  }

  init() {
    this._bindEvents();
    this.generateNewCode();
    this.updateStepView();
  }

  generateNewCode() {
    const typeSelect = document.getElementById('form-type');
    const type = typeSelect ? typeSelect.value : 'QTKT';
    const nextCode = storage.generateNextCode(type);
    
    const codeInput = document.getElementById('form-code');
    if (codeInput) {
      codeInput.value = nextCode;
      this.formData.code = nextCode;
    }
  }

  _bindEvents() {
    // Nút điều hướng các bước
    const btnNext1 = document.getElementById('btn-step1-next');
    const btnPrev2 = document.getElementById('btn-step2-prev');
    const btnNext2 = document.getElementById('btn-step2-next');
    const btnPrev3 = document.getElementById('btn-step3-prev');
    const btnSubmit = document.getElementById('btn-form-submit');
    const btnSaveDraft = document.getElementById('btn-form-draft');

    if (btnNext1) btnNext1.addEventListener('click', () => this.nextStep());
    if (btnPrev2) btnPrev2.addEventListener('click', () => this.prevStep());
    if (btnNext2) btnNext2.addEventListener('click', () => this.nextStep());
    if (btnPrev3) btnPrev3.addEventListener('click', () => this.prevStep());
    if (btnSubmit) btnSubmit.addEventListener('click', () => this.submit());
    if (btnSaveDraft) btnSaveDraft.addEventListener('click', () => this.saveDraft());

    // Thay đổi loại tài liệu -> tự động sinh mã tương ứng
    const typeSelect = document.getElementById('form-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        this.generateNewCode();
      });
    }

    // 1. Chọn tệp tài liệu hoàn chỉnh từ máy tính (Bước 2 - Box A)
    const btnTriggerMain = document.getElementById('btn-trigger-form-file-main');
    const inputMain = document.getElementById('input-form-file-main');
    if (btnTriggerMain && inputMain) {
      btnTriggerMain.addEventListener('click', () => inputMain.click());
      inputMain.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const mbSize = (file.size / (1024 * 1024)).toFixed(1);
          const sizeStr = `${mbSize} MB`;
          this.formData.fileMain = file.name;
          this.formData.fileSize = sizeStr;

          const fileNameEl = document.getElementById('form-main-filename');
          const fileSizeEl = document.getElementById('form-main-filesize');
          if (fileNameEl) fileNameEl.textContent = file.name;
          if (fileSizeEl) fileSizeEl.textContent = `${sizeStr} • Đã nạp từ máy tính`;

          this.showToast(`Đã chọn tệp: ${file.name} (${sizeStr})`, 'upload_file');
        }
      });
    }

    // 2. Thêm tài liệu tham khảo từ máy tính (Bước 2 - Box B)
    const btnAddRef = document.getElementById('btn-add-ref-file');
    const inputRefs = document.getElementById('input-form-file-refs');
    if (btnAddRef && inputRefs) {
      btnAddRef.addEventListener('click', () => inputRefs.click());
      inputRefs.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          files.forEach(f => {
            const sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
            this.formData.refFiles.push({
              name: f.name,
              size: sizeStr,
              note: 'Tải từ máy tính'
            });
          });
          this.renderRefFiles();
          this.showToast(`Đã nạp ${files.length} tài liệu tham khảo từ máy!`, 'attach_file');
        }
      });
    }

    // Render danh sách file tham khảo ban đầu
    this.renderRefFiles();
  }

  renderRefFiles() {
    const refContainer = document.getElementById('form-ref-files-list');
    if (!refContainer) return;

    refContainer.innerHTML = this.formData.refFiles.map((file, idx) => `
      <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <span class="material-symbols-outlined text-[18px] text-red-500">picture_as_pdf</span>
          <div class="flex flex-col min-w-0">
            <span class="font-medium text-slate-800 truncate">${file.name}</span>
            <span class="text-[10px] text-slate-500">${file.size} • ${file.note}</span>
          </div>
        </div>
        <button type="button" class="btn-remove-ref-file text-slate-400 hover:text-red-600" data-index="${idx}">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    `).join('');

    // Gắn sự kiện xóa file tham khảo
    refContainer.querySelectorAll('.btn-remove-ref-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        this.formData.refFiles.splice(idx, 1);
        this.renderRefFiles();
      });
    });
  }

  validateStep(step) {
    if (step === 1) {
      const titleInput = document.getElementById('form-title');
      const authorInput = document.getElementById('form-author');
      
      if (!titleInput || !titleInput.value.trim()) {
        alert('Vui lòng nhập "Tên tài liệu chuyên môn chăm sóc"');
        if (titleInput) titleInput.focus();
        return false;
      }
      if (!authorInput || !authorInput.value.trim()) {
        alert('Vui lòng nhập "Tác giả phụ trách chính"');
        if (authorInput) authorInput.focus();
        return false;
      }

      // Thu thập dữ liệu Bước 1
      const codeInput = document.getElementById('form-code');
      const expectedDateInput = document.getElementById('form-expected-date');
      const typeSelect = document.getElementById('form-type');
      const deptSelect = document.getElementById('form-dept');
      const priorityRadio = document.querySelector('input[name="priority"]:checked');
      const legalBasisInput = document.getElementById('form-legal-basis');

      this.formData.code = codeInput ? codeInput.value : this.formData.code;
      this.formData.expectedDate = expectedDateInput ? expectedDateInput.value : '2026-04-15';
      this.formData.title = titleInput.value.trim();
      this.formData.type = typeSelect ? typeSelect.value : 'QTKT';
      this.formData.typeName = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : '';
      this.formData.priority = priorityRadio && priorityRadio.value ? priorityRadio.value : 'Thường';
      this.formData.department = deptSelect ? deptSelect.value : 'Khoa Điều dưỡng';
      this.formData.author = authorInput.value.trim();
      this.formData.legalBasis = legalBasisInput ? legalBasisInput.value.trim() : '';

      return true;
    }

    if (step === 2) {
      if (this.formData.refFiles.length === 0) {
        if (!confirm('Hồ sơ hiện chưa có tài liệu tham khảo nào. Bạn có chắc muốn tiếp tục không?')) {
          return false;
        }
      }
      return true;
    }

    return true;
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      if (this.currentStep < 3) {
        this.currentStep++;
        this.updateStepView();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepView();
    }
  }

  goToStep(step) {
    if (step >= 1 && step <= 3) {
      this.currentStep = step;
      this.updateStepView();
    }
  }

  updateStepView() {
    // 1. Cập nhật Stepper Visual Indicators
    for (let i = 1; i <= 3; i++) {
      const stepItem = document.getElementById(`form-stepper-step-${i}`);
      const stepBadge = document.getElementById(`form-stepper-badge-${i}`);
      const stepTitle = document.getElementById(`form-stepper-title-${i}`);

      if (!stepItem || !stepBadge) continue;

      if (i < this.currentStep) {
        // Đã hoàn thành (Checked)
        stepItem.className = 'flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 cursor-pointer';
        stepBadge.className = 'w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold';
        stepBadge.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span>';
        if (stepTitle) stepTitle.className = 'text-xs font-bold text-emerald-800';
      } else if (i === this.currentStep) {
        // Đang hoạt động (Active)
        stepItem.className = 'flex items-center gap-3 p-3 rounded-lg bg-blue-50 border-2 border-[#083B76] shadow-xs';
        stepBadge.className = 'w-8 h-8 rounded-full bg-[#083B76] text-white flex items-center justify-center text-xs font-bold shadow-xs';
        stepBadge.textContent = i;
        if (stepTitle) stepTitle.className = 'text-xs font-bold text-[#083B76]';
      } else {
        // Chưa tới (Inactive)
        stepItem.className = 'flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200';
        stepBadge.className = 'w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold';
        stepBadge.textContent = i;
        if (stepTitle) stepTitle.className = 'text-xs font-semibold text-slate-600';
      }
    }

    // 2. Chuyển đổi hiển thị Panels giữa các bước
    const panel1 = document.getElementById('form-step-panel-1');
    const panel2 = document.getElementById('form-step-panel-2');
    const panel3 = document.getElementById('form-step-panel-3');

    if (panel1) panel1.classList.toggle('hidden', this.currentStep !== 1);
    if (panel2) panel2.classList.toggle('hidden', this.currentStep !== 2);
    if (panel3) panel3.classList.toggle('hidden', this.currentStep !== 3);

    // 3. Nếu sang Bước 3, render bản tóm tắt tổng hợp (Review Preview)
    if (this.currentStep === 3) {
      this.renderStep3Review();
    }
  }

  renderStep3Review() {
    const reviewCode = document.getElementById('review-code');
    const reviewTitle = document.getElementById('review-title');
    const reviewType = document.getElementById('review-type');
    const reviewDept = document.getElementById('review-dept');
    const reviewAuthor = document.getElementById('review-author');
    const reviewPriority = document.getElementById('review-priority');
    const reviewDate = document.getElementById('review-date');
    const reviewLegal = document.getElementById('review-legal');
    const reviewMainFile = document.getElementById('review-main-file');
    const reviewRefFiles = document.getElementById('review-ref-files');

    if (reviewCode) reviewCode.textContent = this.formData.code;
    if (reviewTitle) reviewTitle.textContent = this.formData.title || '(Chưa có tiêu đề)';
    if (reviewType) reviewType.textContent = this.formData.typeName || this.formData.type;
    if (reviewDept) reviewDept.textContent = this.formData.department;
    if (reviewAuthor) reviewAuthor.textContent = this.formData.author;
    if (reviewPriority) reviewPriority.textContent = this.formData.priority;
    if (reviewDate) reviewDate.textContent = this.formData.expectedDate || '2026-04-15';
    if (reviewLegal) reviewLegal.textContent = this.formData.legalBasis || 'Chưa ghi nhận';
    if (reviewMainFile) reviewMainFile.textContent = `${this.formData.fileMain} (${this.formData.fileSize})`;

    if (reviewRefFiles) {
      if (this.formData.refFiles.length === 0) {
        reviewRefFiles.innerHTML = '<span class="text-slate-400 italic">Không có</span>';
      } else {
        reviewRefFiles.innerHTML = this.formData.refFiles.map(f => `
          <div class="flex items-center gap-1.5 text-slate-700">
            <span class="material-symbols-outlined text-[14px] text-red-500">picture_as_pdf</span>
            <span class="font-medium">${f.name}</span>
            <span class="text-[10px] text-slate-400">(${f.size})</span>
          </div>
        `).join('');
      }
    }
  }

  saveDraft() {
    this.validateStep(1);
    const newRecord = {
      id: this.formData.code || storage.generateNextCode(this.formData.type),
      code: this.formData.code,
      title: this.formData.title || 'Hồ sơ tài liệu mới (Bản nháp)',
      desc: this.formData.legalBasis || 'Bản ghi lưu nháp tác giả',
      type: this.formData.type,
      typeName: this.formData.typeName,
      version: 'v1.0-draft',
      author: this.formData.author || 'ThSĐD. Nguyễn An',
      department: this.formData.department,
      departmentKey: 'nursing',
      priority: this.formData.priority,
      currentStep: 1,
      status: 'Đang soạn thảo',
      deadline: 'Còn 15 ngày',
      file: this.formData.fileMain,
      fileSize: this.formData.fileSize,
      dateCreated: new Date().toLocaleDateString('vi-VN'),
      dateExpected: this.formData.expectedDate,
      legalBasis: this.formData.legalBasis,
      councilScore: null
    };

    storage.add(newRecord);
    this.showToast(`Đã lưu bản nháp hồ sơ ${newRecord.code}!`, 'task_alt');
    this.onFormSubmitted(newRecord);
    this.resetForm();
  }

  async submit() {
    const btnSubmit = document.getElementById('btn-form-submit');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin text-[16px]">sync</span> Đang gửi hồ sơ & đồng bộ Supabase...';
    }

    const newRecord = {
      id: this.formData.code || storage.generateNextCode(this.formData.type),
      code: this.formData.code,
      title: this.formData.title,
      desc: this.formData.legalBasis || 'Tài liệu chuyên môn chăm sóc người bệnh theo chuẩn Thông tư 31/2021/TT-BYT',
      type: this.formData.type,
      typeName: this.formData.typeName,
      version: 'v1.0',
      author: this.formData.author,
      department: this.formData.department,
      departmentKey: 'nursing',
      priority: this.formData.priority,
      currentStep: 2, // Chuyển sang Bước 2: Tiếp nhận chuyên môn / Thư ký sơ duyệt
      status: 'Đang soát xét',
      deadline: 'Còn 10 ngày',
      file: this.formData.fileMain,
      fileSize: this.formData.fileSize,
      dateCreated: new Date().toLocaleDateString('vi-VN'),
      dateExpected: this.formData.expectedDate,
      legalBasis: this.formData.legalBasis,
      councilScore: null
    };

    // 1. Lưu bản ghi vào Storage phía Client
    storage.add(newRecord);

    // 2. Đồng bộ gửi lên Backend API Server (POST /api/yeu-cau -> Supabase Cloud)
    try {
      const apiPayload = {
        tieu_de: newRecord.title || `Hồ sơ ${newRecord.code}`,
        noi_dung: `${newRecord.desc}. Căn cứ: ${newRecord.legalBasis || 'Thông tư 31/2021/TT-BYT'}`,
        nguoi_gui: newRecord.author || 'Cán bộ Y tế',
        khoa_phong: newRecord.department || 'Khoa Điều dưỡng',
        muc_do_uu_tien: newRecord.priority || 'Bình thường',
        trang_thai: 'Chờ tiếp nhận',
        ghi_chu: `Mã hồ sơ: ${newRecord.code} | Phiên bản: ${newRecord.version}`,
        metadata: {
          code: newRecord.code,
          file: newRecord.file,
          type: newRecord.type,
          version: newRecord.version
        }
      };

      const apiRes = await createYeuCau(apiPayload);
      console.log('✅ Đã đồng bộ lên Backend API & Supabase:', apiRes);
      this.showToast(`Hồ sơ ${newRecord.code} đã nộp & đồng bộ lên Backend Supabase thành công!`, 'cloud_done');
    } catch (apiErr) {
      console.warn('⚠️ Backend API offline hoặc lỗi mạng (dữ liệu đã lưu trữ an toàn cục bộ):', apiErr);
      this.showToast(`Hồ sơ ${newRecord.code} đã lưu cục bộ (Backend offline: ${apiErr.message})`, 'cloud_off');
    }

    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>Nộp hồ sơ & Chuyển Thư ký</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span>';
    }

    this.onFormSubmitted(newRecord);
    this.resetForm();
  }

  resetForm() {
    this.currentStep = 1;
    const titleInput = document.getElementById('form-title');
    if (titleInput) titleInput.value = '';
    this.generateNewCode();
    this.updateStepView();
  }
}
