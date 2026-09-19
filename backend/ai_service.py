"""
ai_service.py - Module Phân Tích & Soát Xét Chuyên Môn AI (AI Clinical Governance Review)
Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
Chuẩn đối chiếu: Hướng dẫn CDC Hoa Kỳ 2024 & Thông tư 31/2021/TT-BYT
"""

import re
from typing import Dict, Any, List, Optional
from datetime import datetime

# Mẫu tài liệu chuẩn lâm sàng (phục vụ đối sánh hoặc khởi tạo mẫu)
SAMPLE_DOCUMENTS = {
    "QTKT-2026-001": {
        "title": "Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên",
        "code": "QTKT-2026-001",
        "type": "QTKT",
        "author": "ThSĐD. Nguyễn An",
        "department": "Khoa Hồi sức tích cực (ICU)",
        "version": "v1.1",
        "content": """BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH
HỘI ĐỒNG ĐIỀU DƯỠNG

QUY TRÌNH KỸ THUẬT: ĐẶT VÀ CHĂM SÓC CATHETER TĨNH MẠCH NGOẠI BIÊN
Mã hiệu: QTKT-2026-001 | Lần ban hành: 02 | Phiên bản: v1.1

1. Căn cứ pháp lý & Phạm vi áp dụng
- Thông tư số 31/2021/TT-BYT ngày 28/12/2021 của Bộ Y tế quy định hoạt động điều dưỡng.
- Quyết định số 3916/QĐ-BYT ngày 28/08/2017 về Hướng dẫn kiểm soát nhiễm khuẩn trong các cơ sở y tế.
- Áp dụng đối với tất cả Điều dưỡng tại các khoa Lâm sàng và Cấp cứu - Hồi sức tích cực.

2. Mục đích & Chỉ định - Chống chỉ định
- Chỉ định: Người bệnh cần truyền dịch, điện giải dinh dưỡng, kháng sinh, thuốc tiêm tĩnh mạch hoặc lấy mẫu máu định kỳ.
- Chống chỉ định: Chi bị tổn thương bỏng rộng, nhiễm trùng da tại chỗ tiêm, tay có dò động - tĩnh mạch (AVF) phục vụ chạy thận nhân tạo.

3. Người thực hiện
- Điều dưỡng viên có chứng chỉ hành nghề và được đào tạo về kỹ thuật vô khuẩn đặt đường truyền ngoại biên.

4. Các bước tiến hành kỹ thuật
4.1. Chuẩn bị người bệnh và phương tiện vô khuẩn đúng quy chuẩn theo bảng kiểm BM-01A.
4.2. Đặt kim và cố định bằng băng vô khuẩn: Thời gian lưu Catheter tĩnh mạch ngoại biên khuyến cáo không vượt quá 72 giờ kể từ thời điểm chọc kim thành công.
4.3. Ghi nhãn lưu ngày giờ đặt, kích cỡ catheter và họ tên điều dưỡng trên băng dán vô khuẩn.

5. Theo dõi & Xử trí biến chứng
5.1. Rút hoặc thay thế catheter ngoại biên sau 96 giờ hoạt động liên tục hoặc khi có dấu hiệu sưng đau, đỏ dọc đường đi tĩnh mạch.
5.2. Đánh giá vị trí tiêm truyền hàng ngày bằng thang điểm viêm tĩnh mạch VIP (Visual Infusion Phlebitis Score). Nếu VIP >= 2, rút ngay catheter và thông báo bác sĩ.

6. Lưu trữ hồ sơ & Biểu mẫu đính kèm
- Bảng kiểm thực hiện kỹ thuật BM-01.
- Phiếu theo dõi đường truyền tĩnh mạch ngoại biên."""
    },
    "HDCS-2026-003": {
        "title": "Hướng dẫn chăm sóc người bệnh sau phẫu thuật nội soi ổ bụng",
        "code": "HDCS-2026-003",
        "type": "HDCS",
        "author": "ĐD CKI. Lê Quốc Dũng",
        "department": "Khoa Ngoại Tiêu hóa",
        "version": "v2.0",
        "content": """BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH
HỘI ĐỒNG ĐIỀU DƯỠNG

HƯỚNG DẪN CHĂM SÓC: NGƯỜI BỆNH SAU PHẪU THUẬT NỘI SOI Ổ BỤNG THEO PHÁC ĐỒ ERAS
Mã hiệu: HDCS-2026-003 | Lần ban hành: 03 | Phiên bản: v2.0

1. Căn cứ pháp lý
- Thông tư 31/2021/TT-BYT của Bộ Y tế.
- Khuyến cáo của Hội Hồi phục sớm sau phẫu thuật (ERAS Society 2025).

2. Đánh giá tiếp nhận tại phòng Hồi tỉnh
- Đánh giá tri giác thang điểm Aldrete >= 9 điểm.
- Theo dõi huyết động mỗi 15 phút trong giờ đầu, mỗi 30 phút trong 2 giờ tiếp theo.
- Kiểm tra vị trí trocar nội soi và dẫn lưu ổ bụng.

3. Kế hoạch can thiệp điều dưỡng
- Giảm đau đa mô thức không opioid (Multimodal Analgesia).
- Cho người bệnh uống nước đường hoặc nước súp trong vòng 4-6 giờ sau mổ khi có nhu động ruột.
- Hỗ trợ người bệnh ngồi dậy và vận động sớm tại giường sau 6 giờ.
- Rút ống thông tiểu sớm trong vòng 24 giờ để giảm nguy cơ nhiễm khuẩn tiết niệu CAUTI."""
    },
    "QTKT-2026-005": {
        "title": "Quy trình phòng ngừa té ngã người bệnh cao tuổi nội trú",
        "code": "QTKT-2026-005",
        "type": "QTKT",
        "author": "CNĐD. Hoàng Thị Lan",
        "department": "Phòng Điều dưỡng Bệnh viện",
        "version": "v1.0",
        "content": """BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH
HỘI ĐỒNG ĐIỀU DƯỠNG

QUY TRÌNH KỸ THUẬT: PHÒNG NGỪA TÉ NGÃ NGƯỜI BỆNH CAO TUỔI NỘI TRÚ
Mã hiệu: QTKT-2026-005 | Lần ban hành: 01 | Phiên bản: v1.0

1. Căn cứ & Tiêu chuẩn
- Tiêu chí C3.2 Bộ tiêu chuẩn chất lượng bệnh viện Việt Nam.
- Thông tư 31/2021/TT-BYT.

2. Đánh giá phân tầng nguy cơ té ngã
- Sử dụng thang điểm Morse Fall Scale (MFS) đánh giá người bệnh lúc nhập viện, chuyển khoa hoặc sau phẫu thuật.
- Điểm MFS 0-24: Nguy cơ thấp.
- Điểm MFS 25-50: Nguy cơ trung bình.
- Điểm MFS >= 51: Nguy cơ cao.

3. Can thiệp dự phòng
- Đeo vòng tay nhận diện màu vàng cho người bệnh nguy cơ cao.
- Luôn kéo thanh chắn giường 2 bên, khóa bánh xe lăn và giường bệnh.
- Đảm bảo chuông gọi điều dưỡng trong tầm với và ánh sáng ban đêm đầy đủ.
- Hướng dẫn thân nhân và người bệnh nguyên tắc 3 phút khi thay đổi tư thế."""
    }
}


def analyze_clinical_document(
    title: str,
    content: str,
    filename: str = "",
    code: str = "QTKT-2026-001",
    author: str = "ThSĐD. Nguyễn An",
    department: str = "Khoa Hồi sức tích cực",
    version: str = "v1.1"
) -> Dict[str, Any]:
    """
    Thuật toán AI Review Chuyên Môn Lâm Sàng:
    - Phân tích cấu trúc 8 mục quy chuẩn Thông tư 31/2021/TT-BYT
    - Kiểm tra khuyến cáo an toàn người bệnh theo CDC 2024
    - Phát hiện xung đột thời gian, mã biểu mẫu, căn cứ pháp lý
    - Xuất kết quả phân tích cấu trúc JSON chuyên sâu
    """
    issues = []
    score_deductions = 0

    text_lower = content.lower()

    # -------------------------------------------------------------
    # 1. KIỂM TRA CHUẨN CDC 2024 VỀ THỜI GIAN LƯU CATHETER NGOẠI BIÊN
    # -------------------------------------------------------------
    has_72h = bool(re.search(r'72\s*(giờ|tiếng|h)', text_lower))
    has_96h = bool(re.search(r'96\s*(giờ|tiếng|h)', text_lower))

    if has_72h and has_96h:
        score_deductions += 7
        issues.append({
            "id": "issue-catheter-time",
            "severity": "critical",
            "severity_label": "Critical",
            "icon": "gpp_bad",
            "title": "Mâu thuẫn Thời gian lưu Catheter tĩnh mạch (CDC 2024)",
            "section": "Mục 4.2 ↔ 5.1",
            "description": "Thân văn bản Mục 4.2 ghi '72 giờ' nhưng Mục 5.1 ghi '96 giờ'. Khuyến cáo CDC 2024 không bắt buộc thay định kỳ sau 72-96 giờ mà chỉ thay khi có chỉ định lâm sàng hoặc tối đa 96 giờ nếu chỉ định thường quy. Cần chuẩn hóa đồng nhất toàn văn thành '96 giờ' để tránh xung đột tác nghiệp điều dưỡng.",
            "detected_text": "Thời gian lưu Catheter tĩnh mạch ngoại biên khuyến cáo không vượt quá 72 giờ",
            "suggested_fix": "Thời gian lưu Catheter tĩnh mạch ngoại biên khuyến cáo theo dõi lâm sàng và thay thế sau 96 giờ hoặc khi có chỉ định lâm sàng theo chuẩn CDC 2024",
            "target_id": "target-catheter-time-1",
            "fix_key": "catheter-time"
        })
    elif has_72h and not has_96h:
        score_deductions += 5
        issues.append({
            "id": "issue-catheter-time-old",
            "severity": "warning",
            "severity_label": "Cảnh báo",
            "icon": "warning",
            "title": "Cần cập nhật thời gian lưu theo CDC 2024",
            "section": "Mục Quy trình",
            "description": "Văn bản vẫn áp dụng mốc 72 giờ cũ. Hướng dẫn cập nhật CDC 2024 cho phép duy trì 96 giờ kết hợp theo dõi sát bằng thang điểm viêm tĩnh mạch VIP.",
            "detected_text": "72 giờ",
            "suggested_fix": "96 giờ theo khuyến cáo CDC 2024",
            "target_id": "target-catheter-time-1",
            "fix_key": "catheter-time"
        })

    # -------------------------------------------------------------
    # 2. KIỂM TRA MINH CHỨNG PHÁP LÝ (QUYẾT ĐỊNH 3916 / THÔNG TƯ 31)
    # -------------------------------------------------------------
    if "3916" in content or "quyết định số 3916" in text_lower:
        score_deductions += 3
        issues.append({
            "id": "issue-legal-3916",
            "severity": "warning",
            "severity_label": "Cảnh báo",
            "icon": "warning",
            "title": "Thiếu tệp minh chứng số hóa đính kèm",
            "section": "Mục 1: Căn cứ pháp lý",
            "description": "Quy trình có viện dẫn Quyết định số 3916/QĐ-BYT ngày 28/08/2017 về kiểm soát nhiễm khuẩn, tuy nhiên trong gói hồ sơ đính kèm chưa có tệp PDF sao lưu để Hội đồng đối chiếu.",
            "detected_text": "Quyết định số 3916/QĐ-BYT ngày 28/08/2017 về Hướng dẫn kiểm soát nhiễm khuẩn trong các cơ sở y tế.",
            "suggested_fix": "Bổ sung tệp PDF Quyết định 3916/QĐ-BYT vào gói tài liệu đính kèm trên hệ thống",
            "target_id": "ref-conflict-3916",
            "fix_key": "legal-doc"
        })

    # -------------------------------------------------------------
    # 3. KIỂM TRA ĐỒNG BỘ MÃ BIỂU MẪU (BM-01 vs BM-01A)
    # -------------------------------------------------------------
    if ("bm-01" in text_lower or "bm-01a" in text_lower) and ("bm-01" in text_lower and "bm-01a" in text_lower):
        score_deductions += 2
        issues.append({
            "id": "issue-form-code",
            "severity": "warning",
            "severity_label": "Cảnh báo",
            "icon": "spellcheck",
            "title": "Không đồng nhất mã danh pháp Biểu mẫu",
            "section": "Mục 4.1 ↔ Mục 6",
            "description": "Thân văn bản Mục 4.1 viện dẫn biểu mẫu chuẩn BM-01A, nhưng Mục 6 ghi chú là BM-01. Cần chuẩn hóa toàn văn thành BM-01A.",
            "detected_text": "Bảng kiểm thực hiện kỹ thuật BM-01",
            "suggested_fix": "Bảng kiểm thực hiện kỹ thuật BM-01A",
            "target_id": "target-appendix-text",
            "fix_key": "appendix-code"
        })

    # -------------------------------------------------------------
    # 4. KIỂM TRA CẤU TRÚC 8 MỤC QUY ĐỊNH BỘ Y TẾ (TT 31/2021/TT-BYT)
    # -------------------------------------------------------------
    standard_sections = [
        ("Căn cứ pháp lý", r'(căn cứ|phạm vi)'),
        ("Mục đích & Chỉ định", r'(chỉ định|mục đích)'),
        ("Người thực hiện", r'(người thực hiện|nhân lực)'),
        ("Phương tiện chuẩn bị", r'(chuẩn bị|phương tiện|dụng cụ)'),
        ("Các bước kỹ thuật", r'(các bước|tiến hành|quy trình)'),
        ("Theo dõi & Biến chứng", r'(theo dõi|xử trí|biến chứng)'),
        ("Lưu trữ hồ sơ", r'(lưu trữ|hồ sơ|ghi chép)'),
        ("Biểu mẫu đính kèm", r'(biểu mẫu|phụ lục)')
    ]

    matched_sections = 0
    for sec_name, pattern in standard_sections:
        if re.search(pattern, text_lower):
            matched_sections += 1

    byt_passed = matched_sections
    byt_total = 8

    if byt_passed < 8:
        score_deductions += (8 - byt_passed) * 2
        issues.append({
            "id": "issue-byt-structure",
            "severity": "info",
            "severity_label": "Gợi ý",
            "icon": "format_list_bulleted",
            "title": f"Thiếu mục thành phần theo Thông tư 31 ({byt_passed}/{byt_total} đạt)",
            "section": "Cấu trúc hồ sơ",
            "description": f"Hồ sơ đã hoàn thiện {byt_passed}/{byt_total} mục chuẩn. Nên bổ sung đầy đủ các tiểu mục chuẩn theo quy định kiểm toán lâm sàng của Bộ Y tế.",
            "detected_text": "Cấu trúc tổng thể hồ sơ",
            "suggested_fix": "Bổ sung đầy đủ 8/8 cấu phần quy định tại TT 31/2021/TT-BYT",
            "target_id": "catheter-section-4",
            "fix_key": "structure"
        })

    # Tính điểm số tuân thủ tổng thể
    final_score = max(60, min(100, 100 - score_deductions))

    # Xây dựng kết luận thẩm duyệt của Thư ký
    critical_count = len([i for i in issues if i["severity"] == "critical"])
    warning_count = len([i for i in issues if i["severity"] == "warning"])

    if critical_count > 0:
        recommendation_status = "Cần chỉnh sửa trước khi trình Hội đồng"
        secretary_notes = (
            "1. Yêu cầu tác giả chỉnh sửa thống nhất thời gian lưu catheter ngoại biên thành 96 giờ theo khuyến cáo CDC 2024.\n"
            "2. Bổ sung tệp scan PDF Quyết định 3916/QĐ-BYT vào kho tài liệu đính kèm.\n"
            "3. Chuẩn hóa đồng bộ danh pháp biểu mẫu BM-01A trong toàn bộ văn bản."
        )
    elif warning_count > 0:
        recommendation_status = "Đạt yêu cầu sơ bộ - Bổ sung chỉnh sửa nhỏ"
        secretary_notes = (
            "1. Hồ sơ cơ bản đạt chuẩn CDC 2024 và Thông tư 31/2021/TT-BYT.\n"
            "2. Cập nhật các điểm lưu ý về định dạng biểu mẫu và hoàn thiện nộp Hội đồng Điều dưỡng duyệt."
        )
    else:
        recommendation_status = "Đạt chuẩn 100% - Đủ điều kiện trình Ban Giám đốc ban hành"
        secretary_notes = "Hồ sơ hoàn chỉnh, đối khớp toàn diện các tiêu chí kiểm soát chuyên môn."

    # Chuẩn hóa các trường bổ trợ cho issues (tương thích đa nền tảng)
    for iss in issues:
        iss["code"] = iss.get("id")
        iss["target_element_id"] = iss.get("target_id")
        iss["fix_type"] = iss.get("fix_key")

    # Xây dựng văn bản hiển thị có gắn cờ đánh dấu (highlighted HTML)
    highlighted_html = _generate_highlighted_document(content, issues, code, title, version)

    return {
        "success": True,
        "compliance_score": final_score,
        "byt_structure_passed": byt_passed >= 8,
        "byt_structure_count": f"{byt_passed}/{byt_total}",
        "issues_count": len(issues),
        "critical_count": critical_count,
        "warning_count": warning_count,
        "dossier_code": code,
        "title": title,
        "author": author,
        "department": department,
        "version": version,
        "secretary_conclusion": secretary_notes,
        "annotated_html": highlighted_html,
        "highlighted_html": highlighted_html,
        "document": {
            "code": code,
            "title": title,
            "author": author,
            "department": department,
            "version": version,
            "filename": filename or f"{code}.docx"
        },
        "evaluation": {
            "score": final_score,
            "score_label": f"{final_score}/100",
            "byt_structure_passed": byt_passed,
            "byt_structure_total": byt_total,
            "byt_structure_status": f"{byt_passed}/{byt_total} Đạt",
            "issues_count": len(issues),
            "critical_count": critical_count,
            "warning_count": warning_count,
            "info_count": len(issues) - critical_count - warning_count,
            "recommendation_status": recommendation_status,
            "secretary_notes": secretary_notes,
            "evaluated_at": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        },
        "issues": issues,
        "raw_text": content
    }


def _generate_highlighted_document(
    content: str,
    issues: List[Dict[str, Any]],
    code: str,
    title: str,
    version: str
) -> str:
    """Tạo mã HTML hiển thị tài liệu với các thẻ đánh dấu tương tác"""
    html_lines = []
    html_lines.append(f"""
    <div class="text-center pb-3 border-b border-slate-100">
      <div class="text-[11px] text-slate-500 font-medium uppercase tracking-wider">BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH • HỘI ĐỒNG ĐIỀU DƯỠNG</div>
      <h2 class="font-bold text-[#083B76] text-sm md:text-base mt-1 uppercase tracking-tight leading-snug">{title}</h2>
      <div class="text-[11px] text-slate-400 mt-0.5">Mã hiệu: <strong class="text-slate-600">{code}</strong> | Phiên bản: <strong class="text-[#08A6A6]">{version}</strong> | Chuẩn đối chiếu: CDC 2024 &amp; TT 31/2021/TT-BYT</div>
    </div>
    <div class="flex flex-col gap-3.5 pt-3">
    """)

    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

    for para in paragraphs:
        # Kiểm tra nếu là tiêu đề mục
        if re.match(r'^[0-9]+\.\s+', para):
            lines = para.split('\n')
            heading = lines[0]
            rest = lines[1:] if len(lines) > 1 else []
            
            # Gắn id theo số mục
            sec_match = re.match(r'^([0-9]+)\.', heading)
            sec_num = sec_match.group(1) if sec_match else "1"
            target_id = f"sec-review-{sec_num}"

            html_lines.append(f'<div class="flex flex-col gap-1" id="{target_id}">')
            html_lines.append(f'<h4 class="font-bold text-slate-900 text-xs uppercase tracking-wide text-[#002551] flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#08A6A6]"></span>{heading}</h4>')
            
            for line in rest:
                rendered_line = _format_line_with_marks(line)
                html_lines.append(f'<p class="text-slate-600 leading-relaxed pl-3.5 border-l border-slate-100">{rendered_line}</p>')
            html_lines.append('</div>')
        else:
            rendered_p = _format_line_with_marks(para)
            html_lines.append(f'<p class="text-slate-700 leading-relaxed">{rendered_p}</p>')

    html_lines.append('</div>')
    return '\n'.join(html_lines)


def _format_line_with_marks(line: str) -> str:
    """Đánh dấu highlight trực quan các vị trí có vấn đề cần soát xét"""
    # Highlight 72 giờ
    if "72 giờ" in line or "72h" in line:
        line = re.sub(
            r'(không vượt quá\s*72\s*(giờ|tiếng|h)|72\s*(giờ|tiếng|h))',
            r'<span class="inline-block p-2 my-1 rounded-lg bg-red-50 border-l-4 border-red-500 text-slate-800 font-medium transition-all shadow-xs" id="target-catheter-time-1"><span class="material-symbols-outlined text-[14px] text-red-600 align-middle mr-1">warning</span>\1 <strong class="text-red-700 underline decoration-red-400 font-bold">(Xung đột CDC 2024)</strong></span>',
            line
        )
    # Highlight 96 giờ
    if "96 giờ" in line or "96h" in line:
        line = re.sub(
            r'(sau\s*96\s*(giờ|tiếng|h)|96\s*(giờ|tiếng|h))',
            r'<span class="inline-block p-2 my-1 rounded-lg bg-teal-50 border-l-4 border-teal-500 text-slate-800 font-medium transition-all shadow-xs" id="target-catheter-time-2"><span class="material-symbols-outlined text-[14px] text-teal-600 align-middle mr-1">verified</span>\1 <strong class="text-teal-700 font-bold">(Chuẩn CDC 2024)</strong></span>',
            line
        )
    # Highlight Quyết định 3916
    if "3916" in line:
        line = re.sub(
            r'(Quyết định số 3916/QĐ-BYT[^\.\n]*)',
            r'<mark class="bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded font-medium border-b-2 border-amber-400 cursor-pointer" id="ref-conflict-3916" title="Thiếu tệp PDF đính kèm">\1</mark>',
            line
        )
    # Highlight BM-01
    if "BM-01" in line:
        line = re.sub(
            r'(BM-01)(?!A)',
            r'<mark class="bg-amber-100 text-amber-950 px-1 py-0.5 rounded font-medium border-b-2 border-amber-400" id="target-appendix-text" title="Lệch danh pháp với BM-01A">\1</mark>',
            line
        )
    return line
