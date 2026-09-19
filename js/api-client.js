/**
 * api-client.js - Client SDK JavaScript Thuần (Vanilla JS) kết nối Backend API
 * Hệ thống: CARE BOARD - Bệnh viện Đại học Y Dược TP.HCM
 * 
 * Sử dụng native Fetch API (async / await) để gọi tới Backend FastAPI / Express
 */

const API_BASE_URL = window.CARE_BOARD_API_URL || '';

/**
 * 1. Gửi yêu cầu mới lên Server (POST /api/yeu-cau)
 * @param {Object} data - Dữ liệu yêu cầu cần gửi
 * @param {string} data.tieu_de - Tiêu đề yêu cầu (Bắt buộc, >= 5 ký tự)
 * @param {string} data.noi_dung - Nội dung chi tiết (Bắt buộc, >= 5 ký tự)
 * @param {string} data.nguoi_gui - Tên cán bộ gửi (Bắt buộc)
 * @param {string} data.khoa_phong - Khoa/phòng công tác (Bắt buộc)
 * @param {string} [data.muc_do_uu_tien='Bình thường'] - 'Khẩn' | 'Cao' | 'Bình thường' | 'Thấp'
 * @param {string} [data.trang_thai='Chờ tiếp nhận'] - Trạng thái ban đầu
 * @returns {Promise<Object>} Phản hồi từ Server
 */
export async function createYeuCau(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/yeu-cau`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || result.detail || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log('✅ [API] Tạo yêu cầu thành công:', result);
    return result;

  } catch (error) {
    console.error('❌ [API] Lỗi khi tạo yêu cầu:', error.message);
    throw error;
  }
}

/**
 * 2. Lấy danh sách yêu cầu mới nhất từ Server (GET /api/yeu-cau)
 * @param {Object} [options] - Tùy chọn truy vấn
 * @param {number} [options.limit=50] - Số lượng bản ghi tối đa
 * @param {number} [options.offset=0] - Vị trí bắt đầu
 * @param {string} [options.status] - Lọc theo trạng thái
 * @returns {Promise<Object>} Danh sách bản ghi và thông tin nguồn dữ liệu
 */
export async function getYeuCauList({ limit = 50, offset = 0, status = null } = {}) {
  try {
    const url = new URL(`${API_BASE_URL || window.location.origin}/api/yeu-cau`);
    url.searchParams.set('limit', limit);
    url.searchParams.set('offset', offset);
    if (status && status !== 'all') {
      url.searchParams.set('status', status);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || result.detail || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log(`✅ [API] Lấy danh sách thành công (${result.total || result.data?.length || 0} bản ghi):`, result);
    return result;

  } catch (error) {
    console.error('❌ [API] Lỗi khi lấy danh sách yêu cầu:', error.message);
    throw error;
  }
}

/**
 * 3. Xóa yêu cầu khỏi Server & Supabase Database (DELETE /api/yeu-cau/:id)
 * @param {string} id - Mã định danh hoặc mã hồ sơ cần xóa
 * @returns {Promise<Object>} Phản hồi từ Server
 */
export async function deleteYeuCau(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/yeu-cau/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || result.detail || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log(`✅ [API] Đã xóa yêu cầu '${id}' thành công:`, result);
    return result;

  } catch (error) {
    console.error(`❌ [API] Lỗi khi xóa yêu cầu '${id}':`, error.message);
    throw error;
  }
}

/**
 * 4. Cập nhật yêu cầu trên Server & Supabase Database (PUT /api/yeu-cau/:id)
 * @param {string} id - Mã định danh hoặc mã hồ sơ cần cập nhật
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} Phản hồi từ Server
 */
export async function updateYeuCau(id, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/yeu-cau/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result.message || result.detail || `Lỗi HTTP: ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log(`✅ [API] Đã cập nhật yêu cầu '${id}' thành công:`, result);
    return result;

  } catch (error) {
    console.error(`❌ [API] Lỗi khi cập nhật yêu cầu '${id}':`, error.message);
    throw error;
  }
}

/**
 * 5. Kiểm tra tình trạng kết nối tới Backend API & Supabase Database (GET /api/health)
 * @returns {Promise<Object>} Tình trạng kết nối và độ trễ
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ [API] Không thể kết nối tới Backend API:', error.message);
    return {
      service: 'offline',
      database: { status: 'disconnected', latency_ms: null }
    };
  }
}

/**
 * 6. Thực hiện AI Review Chuyên Môn (POST /api/ai-review)
 * @param {Object} payload - Thông tin hồ sơ cần soát xét
 * @returns {Promise<Object>} Kết quả đánh giá chuyên môn AI
 */
export async function runAiReview(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || result.message || `Lỗi AI Review: ${response.status}`);
    }
    console.log('🤖 [AI Review] Đánh giá thành công:', result);
    return result;
  } catch (error) {
    console.error('❌ [AI Review] Lỗi khi thực hiện AI Review:', error.message);
    throw error;
  }
}

/**
 * 7. Tải tệp lên để AI Review trực tiếp (POST /api/ai-review-file)
 * @param {FormData} formData - FormData chứa file và các thông tin hồ sơ
 * @returns {Promise<Object>}
 */
export async function runAiReviewFile(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-review-file`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || result.message || `Lỗi AI Review File: ${response.status}`);
    }
    console.log('🤖 [AI Review File] Đánh giá tệp thành công:', result);
    return result;
  } catch (error) {
    console.error('❌ [AI Review File] Lỗi khi AI Review tệp:', error.message);
    throw error;
  }
}

/**
 * 8. Tải tệp tin lên máy chủ lưu trữ (POST /api/upload)
 * @param {File} file - Đối tượng File từ input file
 * @returns {Promise<Object>} Thông tin file đã lưu
 */
export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || result.message || `Lỗi Upload: ${response.status}`);
    }
    console.log('📁 [Upload] Tải lên thành công:', result);
    return result;
  } catch (error) {
    console.error('❌ [Upload] Lỗi khi tải tệp:', error.message);
    throw error;
  }
}

// Đính kèm vào window object để thuận tiện gọi kiểm thử trực tiếp từ Browser DevTools Console
if (typeof window !== 'undefined') {
  window.careBoardApi = {
    createYeuCau,
    getYeuCauList,
    deleteYeuCau,
    updateYeuCau,
    checkBackendHealth,
    runAiReview,
    runAiReviewFile,
    uploadFile,
    API_BASE_URL
  };
}
