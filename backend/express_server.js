/**
 * express_server.js - Phiên bản Backend API bằng Node.js Express
 * Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
 * 
 * Cách chạy:
 * 1. Cài đặt thư viện: npm install express cors dotenv @supabase/supabase-js
 * 2. Khởi chạy: node backend/express_server.js
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Tải biến môi trường từ .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

// Cấu hình Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// ==============================================================================
// KHỞI TẠO KẾT NỐI SUPABASE CLIENT (CONNECTION POOLING SẴN CÓ TRONG HTTP AGENT)
// ==============================================================================
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://isithnzgluzamvnzhlaa.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

if (!SUPABASE_SECRET_KEY) {
  console.warn('⚠️ Cảnh báo: SUPABASE_SECRET_KEY chưa được khai báo trong file .env');
}

// Khởi tạo Supabase client sử dụng service role secret key
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
});

// Bộ nhớ đệm dự phòng trong trường hợp bảng chưa tạo trên cloud
const LOCAL_FALLBACK_STORE = [
  {
    id: 'yc-2026-001',
    tieu_de: 'Đề xuất cập nhật Quy trình thẩm định hồ sơ kỹ thuật điều dưỡng theo CDC 2024',
    noi_dung: 'Khoa Hồi sức tích cực đề nghị rà soát và điều chỉnh thời gian lưu catheter ngoại biên chuẩn 96 giờ.',
    nguoi_gui: 'ThSĐD. Nguyễn An',
    khoa_phong: 'Khoa Hồi sức tích cực',
    muc_do_uu_tien: 'Khẩn',
    trang_thai: 'Đang xử lý',
    created_at: new Date().toISOString()
  }
];

// ==============================================================================
// 1. ENDPOINT: GET /api/health (Kiểm tra trạng thái & kết nối)
// ==============================================================================
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    const { error } = await supabase.from('yeu_cau').select('id').limit(1);
    const latency = Date.now() - startTime;

    res.json({
      service: 'CARE BOARD Node.js Express API',
      status: 'online',
      server_time: new Date().toISOString(),
      supabase: {
        url: SUPABASE_URL,
        latency_ms: latency,
        status: error ? 'notice_schema' : 'connected',
        details: error ? error.message : 'OK'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==============================================================================
// 2. ENDPOINT: POST /api/yeu-cau (Nhận JSON, validate và lưu vào database)
// ==============================================================================
app.post('/api/yeu-cau', async (req, res) => {
  try {
    const { tieu_de, noi_dung, nguoi_gui, khoa_phong, muc_do_uu_tien, trang_thai, ghi_chu, metadata } = req.body;

    // Validation dữ liệu đầu vào chặt chẽ
    if (!tieu_de || typeof tieu_de !== 'string' || tieu_de.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Trường tieu_de là bắt buộc và phải có tối thiểu 5 ký tự.'
      });
    }

    if (!noi_dung || typeof noi_dung !== 'string' || noi_dung.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Trường noi_dung là bắt buộc và phải có tối thiểu 5 ký tự.'
      });
    }

    if (!nguoi_gui || !khoa_phong) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin nguoi_gui và khoa_phong là bắt buộc.'
      });
    }

    const payload = {
      tieu_de: tieu_de.trim(),
      noi_dung: noi_dung.trim(),
      nguoi_gui: nguoi_gui.trim(),
      khoa_phong: khoa_phong.trim(),
      muc_do_uu_tien: muc_do_uu_tien || 'Bình thường',
      trang_thai: trang_thai || 'Chờ tiếp nhận',
      ghi_chu: ghi_chu || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Chèn dữ liệu vào Supabase
    const { data, error } = await supabase
      .from('yeu_cau')
      .insert([payload])
      .select();

    if (error) {
      // Trường hợp bảng chưa có trên cloud -> Fallback
      if (error.code === 'PGRST205' || error.message.includes('not find')) {
        const fallbackItem = { ...payload, id: 'yc-local-' + Date.now() };
        LOCAL_FALLBACK_STORE.unshift(fallbackItem);
        return res.status(201).json({
          success: true,
          message: 'Đã tiếp nhận yêu cầu (lưu bộ nhớ tạm do bảng cloud đang khởi tạo).',
          source: 'local_fallback',
          data: fallbackItem
        });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Đã lưu yêu cầu vào Supabase thành công.',
      source: 'supabase_cloud',
      data: data ? data[0] : payload
    });

  } catch (err) {
    console.error('Lỗi khi chèn yêu cầu:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ khi lưu yêu cầu: ' + err.message
    });
  }
});

// ==============================================================================
// 3. ENDPOINT: GET /api/yeu-cau (Lấy danh sách bản ghi mới nhất)
// ==============================================================================
app.get('/api/yeu-cau', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;

    let query = supabase
      .from('yeu_cau')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('trang_thai', status);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback nếu bảng chưa có trên cloud
      if (error.code === 'PGRST205' || error.message.includes('not find')) {
        let filtered = LOCAL_FALLBACK_STORE;
        if (status && status !== 'all') {
          filtered = filtered.filter(item => item.trang_thai === status);
        }
        return res.json({
          success: true,
          message: 'Lấy danh sách yêu cầu mẫu thành công.',
          source: 'local_fallback',
          total: filtered.length,
          data: filtered.slice(0, limit)
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      message: 'Lấy danh sách yêu cầu từ Supabase thành công.',
      source: 'supabase_cloud',
      total: data ? data.length : 0,
      data: data || []
    });

  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách yêu cầu: ' + err.message
    });
  }
});

// ==============================================================================
// KHỞI ĐỘNG SERVER
// ==============================================================================
app.listen(PORT, HOST, () => {
  console.log(`🚀 CARE BOARD Express API đang chạy tại http://${HOST}:${PORT}`);
  console.log(`📡 Endpoints: POST /api/yeu-cau | GET /api/yeu-cau | GET /api/health`);
});
