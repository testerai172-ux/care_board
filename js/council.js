/**
 * council.js - Xử lý Modal Chấm điểm & Thẩm định Hội đồng Điều dưỡng (HĐĐD)
 * Hệ thống Quản trị Tài liệu Chuyên môn Chăm sóc Người bệnh (CARE BOARD)
 * Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh
 */

import { storage } from './storage.js';

export class CouncilModal {
  constructor(options = {}) {
    this.currentRecord = null;
    this.onEvaluationSaved = options.onEvaluationSaved || (() => {});
    this.showToast = options.showToast || ((msg) => alert(msg));
    this.modalEl = document.getElementById('council-modal');
  }

  init() {
    this._bindEvents();
  }

  _bindEvents() {
    // Nút đóng modal
    const closeBtns = document.querySelectorAll('.btn-close-council-modal');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Nút lưu đánh giá
    const saveBtn = document.getElementById('btn-save-council-eval');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveEvaluation());
    }

    // Lắng nghe thay đổi điểm để tự động tính tổng
    const scoreInputs = ['eval-tc1', 'eval-tc2', 'eval-tc3', 'eval-tc4'];
    scoreInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => this.calculateTotal());
      }
    });

    // Đóng khi click ngoài backdrop
    if (this.modalEl) {
      this.modalEl.addEventListener('click', (e) => {
        if (e.target === this.modalEl) {
          this.close();
        }
      });
    }
  }

  /**
   * Mở modal và nạp dữ liệu hồ sơ
   */
  open(recordId) {
    const record = storage.getById(recordId);
    if (!record) {
      alert(`Không tìm thấy hồ sơ có mã: ${recordId}`);
      return;
    }

    this.currentRecord = record;
    this.populateData(record);

    if (this.modalEl) {
      this.modalEl.classList.remove('hidden');
      this.modalEl.classList.add('flex');
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.classList.add('hidden');
      this.modalEl.classList.remove('flex');
    }
    this.currentRecord = null;
  }

  populateData(record) {
    // Điền thông tin hồ sơ lên banner modal
    const codeEl = document.getElementById('modal-record-code');
    const titleEl = document.getElementById('modal-record-title');
    const metaEl = document.getElementById('modal-record-meta');
    const statusEl = document.getElementById('modal-record-status');

    if (codeEl) codeEl.textContent = record.code;
    if (titleEl) titleEl.textContent = record.title;
    if (metaEl) metaEl.textContent = `${record.author} • ${record.department} • Phiên bản ${record.version || 'v1.0'}`;
    if (statusEl) statusEl.textContent = `Bước ${record.currentStep}/6: ${record.status}`;

    // Điền điểm số cũ nếu đã từng chấm
    const score = record.councilScore || {
      formality: 18,
      evidence: 26,
      safety: 27,
      feasibility: 18,
      conclusion: 'Thông qua có chỉnh sửa',
      notes: '',
      votes: '9/9 Ủy viên (100%)',
      reviewer: 'ThS.ĐD. Lê Hoàng Anh'
    };

    const tc1 = document.getElementById('eval-tc1');
    const tc2 = document.getElementById('eval-tc2');
    const tc3 = document.getElementById('eval-tc3');
    const tc4 = document.getElementById('eval-tc4');
    const notesEl = document.getElementById('eval-notes');
    const votesEl = document.getElementById('eval-votes');
    const reviewerEl = document.getElementById('eval-reviewer');

    if (tc1) tc1.value = score.formality;
    if (tc2) tc2.value = score.evidence;
    if (tc3) tc3.value = score.safety;
    if (tc4) tc4.value = score.feasibility;
    if (notesEl) notesEl.value = score.notes || '';
    if (votesEl) votesEl.value = score.votes || '9/9 Ủy viên (100%)';
    if (reviewerEl) reviewerEl.value = score.reviewer || 'ThS.ĐD. Lê Hoàng Anh';

    // Chọn radio kết luận
    const radioConclusion = document.querySelector(`input[name="eval-conclusion"][value="${score.conclusion}"]`);
    if (radioConclusion) {
      radioConclusion.checked = true;
    } else {
      const defaultRadio = document.querySelector('input[name="eval-conclusion"][value="Thông qua có chỉnh sửa"]');
      if (defaultRadio) defaultRadio.checked = true;
    }

    this.calculateTotal();
  }

  calculateTotal() {
    const tc1 = Math.min(20, Math.max(0, parseInt(document.getElementById('eval-tc1')?.value, 10) || 0));
    const tc2 = Math.min(30, Math.max(0, parseInt(document.getElementById('eval-tc2')?.value, 10) || 0));
    const tc3 = Math.min(30, Math.max(0, parseInt(document.getElementById('eval-tc3')?.value, 10) || 0));
    const tc4 = Math.min(20, Math.max(0, parseInt(document.getElementById('eval-tc4')?.value, 10) || 0));

    const total = tc1 + tc2 + tc3 + tc4;

    const totalEl = document.getElementById('eval-total-score');
    const badgeEl = document.getElementById('eval-grade-badge');

    if (totalEl) totalEl.textContent = `${total}/100`;

    if (badgeEl) {
      if (total >= 90) {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300';
        badgeEl.textContent = 'ĐẠT XUẤT SẮC';
      } else if (total >= 70) {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#083B76] border border-blue-300';
        badgeEl.textContent = 'ĐẠT YÊU CẦU';
      } else if (total >= 50) {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300';
        badgeEl.textContent = 'CẦN CHỈNH SỬA';
      } else {
        badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300';
        badgeEl.textContent = 'KHÔNG ĐẠT';
      }
    }

    return total;
  }

  saveEvaluation() {
    if (!this.currentRecord) return;

    const tc1 = parseInt(document.getElementById('eval-tc1')?.value, 10) || 0;
    const tc2 = parseInt(document.getElementById('eval-tc2')?.value, 10) || 0;
    const tc3 = parseInt(document.getElementById('eval-tc3')?.value, 10) || 0;
    const tc4 = parseInt(document.getElementById('eval-tc4')?.value, 10) || 0;
    const total = tc1 + tc2 + tc3 + tc4;

    const conclusionRadio = document.querySelector('input[name="eval-conclusion"]:checked');
    const conclusion = conclusionRadio ? conclusionRadio.value : 'Thông qua có chỉnh sửa';
    const notes = document.getElementById('eval-notes')?.value || '';
    const votes = document.getElementById('eval-votes')?.value || '9/9 Ủy viên (100%)';
    const reviewer = document.getElementById('eval-reviewer')?.value || 'Ủy ban Thẩm định HĐĐD';

    // Cập nhật bước và trạng thái dựa trên kết luận thẩm định
    let newStep = this.currentRecord.currentStep;
    let newStatus = this.currentRecord.status;

    if (conclusion === 'Thông qua') {
      newStep = 6; // Chuyển sang Ban hành
      newStatus = 'Đã ban hành';
    } else if (conclusion === 'Thông qua có chỉnh sửa') {
      newStep = 5; // Hoàn thiện sau góp ý
      newStatus = 'Đã hoàn chỉnh';
    } else if (conclusion === 'Yêu cầu chỉnh sửa') {
      newStep = 3; // Sơ duyệt / Chỉnh sửa
      newStatus = 'Cần bổ sung';
    }

    const evaluationData = {
      formality: tc1,
      evidence: tc2,
      safety: tc3,
      feasibility: tc4,
      total,
      conclusion,
      notes,
      votes,
      reviewer,
      evalDate: new Date().toLocaleDateString('vi-VN')
    };

    // Cập nhật vào Storage
    const updated = storage.update(this.currentRecord.id, {
      councilScore: evaluationData,
      currentStep: newStep,
      status: newStatus
    });

    this.showToast(`Đã lưu biên bản chấm điểm HĐĐD cho hồ sơ ${this.currentRecord.code} (${total}/100đ - ${conclusion})`, 'task_alt');
    this.close();
    this.onEvaluationSaved(updated);
  }
}
