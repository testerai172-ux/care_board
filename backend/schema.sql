-- ==============================================================================
-- DDL SCRIPT: TẠO BẢNG YEU_CAU TRÊN SUPABASE (POSTGRESQL)
-- Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
-- Hướng dẫn: Dán câu lệnh này vào Supabase Studio -> SQL Editor -> Run
-- ==============================================================================

-- 1. Bật extension UUID nếu chưa có
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tạo bảng yeu_cau
CREATE TABLE IF NOT EXISTS public.yeu_cau (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    nguoi_gui VARCHAR(150) NOT NULL,
    khoa_phong VARCHAR(150) NOT NULL,
    muc_do_uu_tien VARCHAR(50) DEFAULT 'Bình thường', -- 'Khẩn', 'Cao', 'Bình thường', 'Thấp'
    trang_thai VARCHAR(50) DEFAULT 'Chờ tiếp nhận',   -- 'Chờ tiếp nhận', 'Đang xử lý', 'Đã duyệt', 'Từ chối'
    ghi_chu TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Ho_Chi_Minh', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('Asia/Ho_Chi_Minh', NOW())
);

-- 3. Tạo Indexes tối ưu hóa truy vấn danh sách mới nhất và theo trạng thái
CREATE INDEX IF NOT EXISTS idx_yeu_cau_created_at ON public.yeu_cau (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_trang_thai ON public.yeu_cau (trang_thai);
CREATE INDEX IF NOT EXISTS idx_yeu_cau_khoa_phong ON public.yeu_cau (khoa_phong);

-- 4. Kích hoạt Row Level Security (RLS)
ALTER TABLE public.yeu_cau ENABLE ROW LEVEL SECURITY;

-- 5. Tạo chính sách RLS cho phép Backend (Service Role Secret Key) toàn quyền thao tác
CREATE POLICY "Full access for service role" ON public.yeu_cau
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Cho phép đọc công khai hoặc qua anon key nếu cần
CREATE POLICY "Read access for authenticated and anon" ON public.yeu_cau
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ==============================================================================
-- Dữ liệu mẫu ban đầu (Optional Seed)
-- ==============================================================================
INSERT INTO public.yeu_cau (tieu_de, noi_dung, nguoi_gui, khoa_phong, muc_do_uu_tien, trang_thai)
VALUES 
(
    'Đề xuất cập nhật Quy trình thẩm định hồ sơ kỹ thuật điều dưỡng theo CDC 2024',
    'Khoa Hồi sức tích cực đề nghị rà soát và điều chỉnh thời gian lưu catheter ngoại biên chuẩn 96 giờ.',
    'ThSĐD. Nguyễn An',
    'Khoa Hồi sức tích cực',
    'Khẩn',
    'Đang xử lý'
),
(
    'Yêu cầu cấp phát tài khoản số hóa tài liệu cho Điều dưỡng trưởng khối Ngoại',
    'Đăng ký quyền thẩm tra và ký số tài liệu chuyên môn nội bộ đợt 1 năm 2026.',
    'ĐD CKI. Lê Quốc Dũng',
    'Khoa Ngoại Tiêu hóa',
    'Bình thường',
    'Chờ tiếp nhận'
);
