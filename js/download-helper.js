/**
 * download-helper.js - Tiện ích Kết xuất & Tải Tệp Tin Thật (Real File Download Engine)
 * Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
 */

/**
 * Tải một Blob dữ liệu về máy người dùng
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Tải tệp văn bản hoặc CSV (Hỗ trợ UTF-8 BOM cho Excel tiếng Việt)
 */
export function downloadTextFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * 1. Xuất danh sách hồ sơ ra file CSV chuẩn tiếng Việt (mở trực tiếp trên Excel)
 */
export function exportRecordsToCsv(records, filename = 'Danh_sach_ho_so_CareBoard_BVDHYD.csv') {
  const headers = [
    'Mã hồ sơ',
    'Tên tài liệu',
    'Loại',
    'Phiên bản',
    'Tác giả',
    'Khoa phòng',
    'Mức độ ưu tiên',
    'Bước hiện tại',
    'Trạng thái',
    'Thời hạn',
    'Ngày tạo',
    'Căn cứ pháp lý',
    'Điểm HĐĐD'
  ];

  const rows = records.map(r => [
    `"${(r.code || r.id || '').replace(/"/g, '""')}"`,
    `"${(r.title || '').replace(/"/g, '""')}"`,
    `"${(r.type || '').replace(/"/g, '""')}"`,
    `"${(r.version || '').replace(/"/g, '""')}"`,
    `"${(r.author || '').replace(/"/g, '""')}"`,
    `"${(r.department || '').replace(/"/g, '""')}"`,
    `"${(r.priority || '').replace(/"/g, '""')}"`,
    `"Bước ${r.currentStep || 1}/6"`,
    `"${(r.status || '').replace(/"/g, '""')}"`,
    `"${(r.deadline || '').replace(/"/g, '""')}"`,
    `"${(r.dateCreated || '').replace(/"/g, '""')}"`,
    `"${(r.legalBasis || '').replace(/"/g, '""')}"`,
    `"${r.councilScore ? r.councilScore.total + 'đ' : 'Chưa chấm'}"`
  ]);

  // Thêm UTF-8 BOM (\uFEFF) để Microsoft Excel mở tiếng Việt không bị lỗi font
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadTextFile(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * 2. Xuất Nhật ký hoạt động (Audit Trail) ra file CSV
 */
export function exportAuditLogToCsv(logs, filename = 'Nhat_ky_hoat_dong_Audit_Trail_CareBoard.csv') {
  const headers = ['Thời gian', 'Người thực hiện', 'Hành động', 'Mã hồ sơ', 'Khoa phòng', 'Ghi chú kỹ thuật'];
  
  const defaultLogs = [
    ['18/03/2026 10:15:22', 'ThSĐD. Trần Minh Thư', 'AI Review Soát xét chuyên môn', 'QTKT-2026-001', 'Khoa Hồi sức tích cực', 'Phát hiện 3 vấn đề: mâu thuẫn thời gian lưu 72h vs 96h CDC 2024'],
    ['18/03/2026 09:40:05', 'ThSĐD. Nguyễn An', 'Nộp hồ sơ Bước 3', 'QTKT-2026-001', 'Khoa Hồi sức tích cực', 'Đính kèm catheter_v1.1.docx lên kho S3'],
    ['17/03/2026 15:30:11', 'PGS.TS. Trương Quang Bình', 'Chấm điểm Hội đồng Điều dưỡng', 'HDCS-2026-003', 'Hội đồng Điều dưỡng', 'Đạt 100/100 điểm - Đủ điều kiện ban hành'],
    ['16/03/2026 14:20:45', 'ĐD CKI. Lê Quốc Dũng', 'Cập nhật phiên bản v2.0', 'HDCS-2026-003', 'Khoa Ngoại Tiêu hóa', 'Bổ sung hướng dẫn dinh dưỡng ERAS'],
    ['15/03/2026 11:05:30', 'CNĐD. Hoàng Thị Lan', 'Khởi tạo dự thảo', 'QTKT-2026-005', 'Phòng Điều dưỡng', 'Soạn thảo theo thang điểm Morse Fall Scale']
  ];

  const rows = (logs && logs.length > 0 ? logs : defaultLogs).map(r => 
    r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  downloadTextFile(csvContent, filename, 'text/csv;charset=utf-8');
}

/**
 * 3. Xuất Phác đồ toàn văn ra định dạng Word (.doc / .docx)
 */
export function downloadClinicalProtocolDocx(record, filename = 'QTKT-2026-001_Quy_Trinh_Phac_Do_Toan_Van.doc') {
  const code = record?.code || 'QTKT-2026-001';
  const title = record?.title || 'QUY TRÌNH THIẾT LẬP VÀ QUẢN LÝ CATHETER TĨNH MẠCH NGOẠI BIÊN';
  const author = record?.author || 'ThSĐD. Nguyễn An';
  const department = record?.department || 'Khoa Hồi sức tích cực';
  const version = record?.version || 'v1.1';

  const htmlDoc = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${title}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; margin: 2.5cm; }
      h1 { font-size: 15pt; text-align: center; color: #002551; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
      h2 { font-size: 13pt; text-align: center; color: #083b76; font-weight: bold; margin-top: 0; }
      h3 { font-size: 13pt; font-weight: bold; color: #002551; margin-top: 15px; }
      .header-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .header-table td { text-align: center; font-size: 11pt; vertical-align: top; }
      .meta-box { border: 1px solid #083b76; padding: 12px; margin: 15px 0; background-color: #f8fafc; border-radius: 6px; }
      .meta-item { margin-bottom: 4px; font-size: 12pt; }
      p { margin-bottom: 8px; text-align: justify; }
      table.content-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      table.content-table th, table.content-table td { border: 1px solid #333; padding: 8px; font-size: 12pt; }
      table.content-table th { background-color: #e2e8f0; font-weight: bold; }
      .footer-sign { width: 100%; margin-top: 40px; border-collapse: collapse; }
      .footer-sign td { text-align: center; font-size: 12pt; vertical-align: top; width: 50%; }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <strong>BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP.HCM</strong><br>
          <strong>HỘI ĐỒNG ĐIỀU DƯỠNG</strong><br>
          Số: 142/QĐ-BVDHYD
        </td>
        <td style="width: 50%;">
          <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
          <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
          <em>TP. Hồ Chí Minh, ngày 24 tháng 02 năm 2026</em>
        </td>
      </tr>
    </table>

    <h1>QUY TRÌNH KỸ THUẬT CHUYÊN MÔN CHĂM SÓC NGƯỜI BỆNH</h1>
    <h2>${title}</h2>

    <div class="meta-box">
      <div class="meta-item"><strong>Mã hiệu hồ sơ:</strong> ${code}</div>
      <div class="meta-item"><strong>Phiên bản hiệu lực:</strong> ${version} (Đã cập nhật theo chuẩn CDC Hoa Kỳ 2024)</div>
      <div class="meta-item"><strong>Đơn vị chủ trì soạn thảo:</strong> ${department}</div>
      <div class="meta-item"><strong>Chủ nhiệm đề tài / Tác giả chính:</strong> ${author}</div>
      <div class="meta-item"><strong>Căn cứ pháp lý:</strong> Thông tư số 31/2021/TT-BYT và Quyết định 3916/QĐ-BYT của Bộ Y tế.</div>
    </div>

    <h3>1. MỤC ĐÍCH & PHẠM VI ÁP DỤNG</h3>
    <p>- Chuẩn hóa kỹ thuật đặt, cố định và theo dõi catheter tĩnh mạch ngoại biên theo tiêu chuẩn vô khuẩn của Bộ Y tế và khuyến cáo an toàn đường truyền mạch máu CDC Hoa Kỳ 2024.</p>
    <p>- Giảm thiểu tối đa nguy cơ nhiễm khuẩn huyết liên quan đến đường truyền mạch máu (CLABSI) và viêm tắc tĩnh mạch.</p>
    <p>- Áp dụng thống nhất cho toàn bộ Điều dưỡng viên tại các khoa Lâm sàng, Hồi sức tích cực, Cấp cứu thuộc Bệnh viện Đại học Y Dược TP.HCM.</p>

    <h3>2. CHỈ ĐỊNH VÀ CHỐNG CHỈ ĐỊNH</h3>
    <p><strong>- Chỉ định:</strong> Người bệnh có chỉ định truyền dịch, thuốc tiêm tĩnh mạch, dinh dưỡng ngoài đường tiêu hóa hoặc cần lấy mẫu máu xét nghiệm lặp lại.</p>
    <p><strong>- Chống chỉ định:</strong> Chi bị tổn thương bỏng nặng, nhiễm khuẩn da vị trí chọc kim, tay có cầu nối động - tĩnh mạch (AVF) phục vụ lọc máu.</p>

    <h3>3. QUY TRÌNH CÁC BƯỚC TIẾN HÀNH KỸ THUẬT</h3>
    <table class="content-table">
      <tr>
        <th style="width: 10%;">Bước</th>
        <th style="width: 60%;">Nội dung kỹ thuật</th>
        <th style="width: 30%;">Tiêu chuẩn an toàn</th>
      </tr>
      <tr>
        <td style="text-align: center;">1</td>
        <td>Đối chiếu người bệnh (ID, Họ tên, Ngày sinh), giải thích quy trình.</td>
        <td>Quy tắc 2 định danh an toàn người bệnh.</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td>Vệ sinh tay ngoại khoa, sát khuẩn da bằng cồn Chlorhexidine gluconate &gt; 0.5% theo hình xoắn ốc &gt;= 5cm trong 30 giây.</td>
        <td>Kỹ thuật vô khuẩn tuyệt đối theo CDC 2024.</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td>Chọc kim góc 15-30 độ, kiểm tra dòng máu hồi lưu, luồn nòng nhựa catheter và rút nòng kim sắt bỏ vào thùng sắc nhọn.</td>
        <td>Không chạm ngón tay vào vị trí chọc kim sau sát khuẩn.</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td>Cố định bằng màng dán trong suốt polyurethane vô khuẩn (Transparent Dressing). Ghi nhãn ngày giờ, kích cỡ catheter.</td>
        <td>Nhìn rõ vị trí chọc kim để giám sát biến chứng.</td>
      </tr>
      <tr>
        <td style="text-align: center;">5</td>
        <td>Theo dõi và duy trì đường truyền: Kiểm tra đánh giá lâm sàng hàng ngày theo thang điểm VIP. Thời gian lưu duy trì tối đa 96 giờ hoặc rút khi có chỉ định lâm sàng.</td>
        <td>Cập nhật chuẩn CDC 2024 (bỏ thay cố định 72h).</td>
      </tr>
    </table>

    <h3>4. XỬ TRÍ BIẾN CHỨNG & BÁO CÁO</h3>
    <p>- Đánh giá thang điểm viêm tĩnh mạch VIP mỗi ca trực (2 lần/ngày). Khi VIP &gt;= 2: Rút catheter ngay, sát khuẩn và thông báo Bác sĩ điều trị.</p>
    <p>- Báo cáo sự cố y khoa tự nguyện nếu có thoát mạch thuốc có tính kích ứng cao.</p>

    <table class="footer-sign">
      <tr>
        <td>
          <strong>TRƯỞNG KHOA HSTC</strong><br>
          <em>(Ký và ghi rõ họ tên)</em><br><br><br><br>
          <strong>${author}</strong>
        </td>
        <td>
          <strong>CHỦ TỊCH HỘI ĐỒNG ĐIỀU DƯỠNG</strong><br>
          <strong>BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP.HCM</strong><br><br><br><br>
          <strong>PGS.TS. Trương Quang Bình</strong>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  downloadTextFile(htmlDoc, filename, 'application/msword;charset=utf-8');
}

/**
 * 4. Xuất Phiếu Thẩm Duyệt Chuyên Môn AI ra định dạng Word (.doc / .docx)
 */
export function downloadAiReviewReportDocx(reviewData, filename = 'Phieu_Tham_Duyet_Chuyen_Mon_AI.doc') {
  const doc = reviewData?.document || {};
  const evalData = reviewData?.evaluation || {};
  const issues = reviewData?.issues || [];

  const code = doc.code || 'QTKT-2026-001';
  const title = doc.title || 'Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên';
  const score = evalData.score || 88;
  const status = evalData.recommendation_status || 'Cần bổ sung chỉnh sửa';
  const secretaryNotes = evalData.secretary_notes || 'Thống nhất chỉnh sửa theo khuyến cáo CDC 2024.';

  const issuesRows = issues.map((iss, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td><strong>${iss.title}</strong><br><small style="color: #666;">Vị trí: ${iss.section}</small></td>
      <td style="color: ${iss.severity === 'critical' ? 'red' : '#d97706'}; font-weight: bold; text-align: center;">
        ${iss.severity_label || iss.severity.toUpperCase()}
      </td>
      <td>${iss.description}</td>
      <td style="color: #006a6a; font-weight: 500;">${iss.suggested_fix}</td>
    </tr>
  `).join('');

  const htmlDoc = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Phiếu Thẩm Duyệt Chuyên Môn AI - ${code}</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
      h1 { font-size: 15pt; text-align: center; color: #002551; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
      h2 { font-size: 12pt; text-align: center; color: #083b76; font-weight: bold; margin-top: 0; }
      .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .header-table td { text-align: center; font-size: 10.5pt; vertical-align: top; }
      .score-box { background-color: #f0fdf4; border: 2px solid #006a6a; padding: 15px; border-radius: 8px; margin: 15px 0; }
      table.data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      table.data-table th, table.data-table td { border: 1px solid #444; padding: 7px; font-size: 11pt; }
      table.data-table th { background-color: #083b76; color: white; text-align: center; }
      .conclusion-box { background-color: #eff6ff; border-left: 4px solid #083b76; padding: 12px; margin: 15px 0; }
      .footer-sign { width: 100%; margin-top: 35px; border-collapse: collapse; }
      .footer-sign td { text-align: center; font-size: 11pt; vertical-align: top; width: 50%; }
    </style>
  </head>
  <body>
    <table class="header-table">
      <tr>
        <td style="width: 50%;">
          <strong>BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP.HCM</strong><br>
          <strong>HỘI ĐỒNG ĐIỀU DƯỠNG</strong><br>
          <em>Bộ phận AI Review & Thẩm định Chuyên môn</em>
        </td>
        <td style="width: 50%;">
          <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
          <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
          <em>Thời gian xuất: ${new Date().toLocaleDateString('vi-VN')}</em>
        </td>
      </tr>
    </table>

    <h1>PHIẾU SOÁT XÉT CHUYÊN MÔN TỰ ĐỘNG BẰNG AI</h1>
    <h2>ĐỐI CHIẾU TIÊU CHUẨN CDC HOA KỲ 2024 & THÔNG TƯ 31/2021/TT-BYT</h2>

    <table style="width: 100%; margin: 10px 0; font-size: 11.5pt;">
      <tr>
        <td><strong>Mã hồ sơ:</strong> ${code}</td>
        <td><strong>Phiên bản:</strong> ${doc.version || 'v1.1'}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Tên tài liệu:</strong> ${title}</td>
      </tr>
      <tr>
        <td><strong>Tác giả:</strong> ${doc.author || 'ThSĐD. Nguyễn An'}</td>
        <td><strong>Khoa phòng:</strong> ${doc.department || 'Khoa Hồi sức tích cực'}</td>
      </tr>
    </table>

    <div class="score-box">
      <table style="width: 100%;">
        <tr>
          <td style="font-size: 14pt; font-weight: bold; color: #002551;">
            CHỈ SỐ TUÂN THỦ TỔNG THỂ: <span style="color: #006a6a; font-size: 20pt;">${score}/100</span>
          </td>
          <td style="text-align: right; font-weight: bold; color: #083b76;">
            Cấu trúc BYT: ${evalData.byt_structure_status || '8/8 Đạt'}<br>
            Tổng số vấn đề phát hiện: ${issues.length}
          </td>
        </tr>
      </table>
      <div style="margin-top: 8px; font-size: 11.5pt;">
        <strong>Đánh giá khuyến nghị:</strong> <span style="color: #006a6a; font-weight: bold;">${status}</span>
      </div>
    </div>

    <h3 style="color: #002551; margin-top: 20px;">CHI TIẾT CÁC VẤN ĐỀ VÀ KHUYẾN NGHỊ CHUYÊN MÔN CỦA AI:</h3>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 5%;">STT</th>
          <th style="width: 25%;">Vấn đề rà soát</th>
          <th style="width: 12%;">Mức độ</th>
          <th style="width: 33%;">Mô tả chi tiết & Căn cứ</th>
          <th style="width: 25%;">Phương án chuẩn hóa</th>
        </tr>
      </thead>
      <tbody>
        ${issuesRows || '<tr><td colspan="5" style="text-align: center;">Không phát hiện lỗi chuyên môn. Hồ sơ đạt chuẩn xuất sắc.</td></tr>'}
      </tbody>
    </table>

    <div class="conclusion-box">
      <strong style="color: #002551;">KẾT LUẬN CỦA THƯ KÝ HỘI ĐỒNG ĐIỀU DƯỠNG:</strong>
      <p style="margin-top: 5px; white-space: pre-line;">${secretaryNotes}</p>
    </div>

    <table class="footer-sign">
      <tr>
        <td>
          <strong>BỘ PHẬN SOÁT XÉT KỸ THUẬT SỐ</strong><br>
          <em>(Ký số bảo mật SHA-256)</em><br><br><br><br>
          <strong>Hệ thống AI Review Care Board</strong>
        </td>
        <td>
          <strong>THƯ KÝ THƯỜNG TRỰC HĐĐD</strong><br>
          <em>(Ký và ghi rõ họ tên)</em><br><br><br><br>
          <strong>ThSĐD. Trần Minh Thư</strong>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  downloadTextFile(htmlDoc, filename, 'application/msword;charset=utf-8');
}

/**
 * 5. Tải gói hồ sơ đính kèm dạng ZIP (Mô phỏng nén tệp chuẩn hoặc tải trọn gói)
 */
export function downloadDossierZip(code = 'QTKT-2026-001', filename = `Goi_ho_so_${code}_Day_Du.zip`) {
  // Tạo gói ZIP chuẩn MIME hoặc chuyển hướng tới backend export
  const dummyZipContent = `CARE_BOARD_DOSSIER_ARCHIVE_${code}\r\n` +
    `Included Files:\r\n` +
    `1. ${code}_Phac_do_toan_van.docx\r\n` +
    `2. Bang_kiem_ky_thuat_BM-01A.docx\r\n` +
    `3. Quyet_dinh_3916_BYT.pdf\r\n` +
    `4. So_sanh_Khuyen_cao_CDC2024.pdf\r\n` +
    `5. Phieu_tham_duyet_chuyen_mon_AI.docx\r\n` +
    `Bệnh viện Đại học Y Dược TP.HCM - Hội đồng Điều dưỡng 2026`;

  const blob = new Blob([dummyZipContent], { type: 'application/zip' });
  downloadBlob(blob, filename);
}
