/**
 * storage.js - Quản lý Dữ liệu & localStorage
 * Hệ thống Quản trị Tài liệu Chuyên môn Chăm sóc Người bệnh (CARE BOARD)
 * Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh
 */

const STORAGE_KEY = 'CARE_BOARD_DATA_V1';

// Dữ liệu mẫu chuẩn hóa ban đầu theo quy chuẩn BV ĐHYD TP.HCM
const DEFAULT_RECORDS = [
  {
    id: 'QTKT-2026-001',
    code: 'QTKT-2026-001',
    title: 'Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên',
    desc: 'Kỹ thuật vô khuẩn, cố định màng trong suốt và theo dõi viêm tắc tĩnh mạch theo CDC 2024',
    type: 'QTKT',
    typeName: 'Quy trình kỹ thuật điều dưỡng',
    version: 'v1.1',
    author: 'ĐD CKI. Lê Quốc Dũng',
    department: 'Khoa Hồi sức tích cực',
    departmentKey: 'icu',
    priority: 'Khẩn',
    currentStep: 3, // 1: Soạn thảo, 2: Chuyên môn, 3: Sơ duyệt, 4: HĐĐD, 5: Hoàn thiện, 6: Ban hành
    status: 'Cần bổ sung',
    deadline: 'Còn 2 ngày',
    file: 'catheter_v1.1.docx',
    fileSize: '2.8 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '10/01/2026',
    dateExpected: '2026-03-25',
    legalBasis: 'Căn cứ Thông tư 31/2021/TT-BYT và khuyến cáo CDC 2024 về an toàn đường truyền mạch máu.',
    councilScore: {
      formality: 18,
      evidence: 26,
      safety: 28,
      feasibility: 18,
      total: 90,
      conclusion: 'Thông qua có chỉnh sửa',
      notes: 'Yêu cầu cập nhật theo CDC 2024: bỏ thay định kỳ 72-96 giờ, chỉ thay khi có dấu hiệu lâm sàng.',
      votes: '9/9 Ủy viên (100%)',
      evalDate: '18/02/2026',
      reviewer: 'ThS.ĐD. Lê Hoàng Anh (Khoa HSTC)'
    }
  },
  {
    id: 'HDCS-2026-003',
    code: 'HDCS-2026-003',
    title: 'Hướng dẫn chăm sóc người bệnh sau phẫu thuật nội soi ổ bụng',
    desc: 'Kế hoạch dinh dưỡng sớm, phục hồi lưu thông ruột và vận động sớm sau mổ theo phác đồ ERAS',
    type: 'HDCS',
    typeName: 'Hướng dẫn chăm sóc lâm sàng',
    version: 'v2.0',
    author: 'ThSĐD. Nguyễn An',
    department: 'Khoa Ngoại Tiêu hóa',
    departmentKey: 'thoracic',
    priority: 'Thường',
    currentStep: 6,
    status: 'Đã ban hành',
    deadline: 'Hoàn tất',
    file: 'HDCS_NoiSoi_v2.0.docx',
    fileSize: '3.2 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '05/01/2026',
    dateExpected: '2026-02-24',
    decisionNumber: '142/QĐ-BVDHYD',
    legalBasis: 'Quy chuẩn hồi phục sớm sau phẫu thuật ERAS 2025 kết hợp Thông tư 31/2021/TT-BYT.',
    councilScore: {
      formality: 20,
      evidence: 30,
      safety: 30,
      feasibility: 20,
      total: 100,
      conclusion: 'Thông qua',
      notes: 'Đã hoàn tất hiệu đính và đối khớp 100% yêu cầu thẩm định chuyên môn.',
      votes: '9/9 Ủy viên (100%)',
      evalDate: '24/02/2026',
      reviewer: 'GS.TS Trương Thành Nam'
    }
  },
  {
    id: 'QTKT-2026-005',
    code: 'QTKT-2026-005',
    title: 'Quy trình phòng ngừa té ngã người bệnh cao tuổi nội trú',
    desc: 'Thang điểm Morse Fall Scale và kế hoạch can thiệp điều dưỡng phân tầng theo bậc rủi ro',
    type: 'QTKT',
    typeName: 'Quy trình kỹ thuật điều dưỡng',
    version: 'v1.0 (Rev.2)',
    author: 'CNĐD. Hoàng Thị Lan',
    department: 'Phòng Điều dưỡng Bệnh viện',
    departmentKey: 'nursing',
    priority: 'Thường',
    currentStep: 5,
    status: 'Đã hoàn chỉnh',
    deadline: 'Còn 3 ngày',
    file: 'QTKT_PhongNguaTeNga_v1.0.docx',
    fileSize: '1.9 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '15/01/2026',
    dateExpected: '2026-03-20',
    legalBasis: 'Tiêu chuẩn chất lượng bệnh viện Bộ Y tế - Tiêu chí C3.2 về phòng ngừa ngã người bệnh.',
    councilScore: {
      formality: 19,
      evidence: 27,
      safety: 29,
      feasibility: 19,
      total: 94,
      conclusion: 'Thông qua',
      notes: 'Đã bổ sung bảng hướng dẫn thân nhân người bệnh và biển cảnh báo đầu giường.',
      votes: '9/9 Ủy viên (100%)',
      evalDate: '02/03/2026',
      reviewer: 'ThSĐD. Trần Minh Thư'
    }
  },
  {
    id: 'HDCS-2026-007',
    code: 'HDCS-2026-007',
    title: 'Theo dõi tri giác và dấu hiệu sinh tồn người bệnh chấn thương sọ não',
    desc: 'Đánh giá thang điểm Glasgow, phản xạ đồng tử và phát hiện sớm tăng áp lực nội sọ cấp cứu',
    type: 'HDCS',
    typeName: 'Hướng dẫn chăm sóc lâm sàng',
    version: 'v1.0',
    author: 'BS. Trần Văn Nam',
    department: 'Khoa Hồi sức cấp cứu (ICU)',
    departmentKey: 'icu',
    priority: 'Khẩn',
    currentStep: 3,
    status: 'Cần bổ sung',
    deadline: 'Trễ 1 ngày',
    file: 'HDCS_TriGiac_CTSN.docx',
    fileSize: '2.1 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '20/01/2026',
    dateExpected: '2026-03-10',
    legalBasis: 'Phác đồ điều trị chấn thương sọ não - Hội Ngoại Thần kinh Việt Nam.',
    councilScore: null
  },
  {
    id: 'QĐCK-2026-002',
    code: 'QĐCK-2026-002',
    title: 'Quy định bàn giao người bệnh chuyển từ phòng mổ về phòng Hồi tỉnh',
    desc: 'Chuẩn hóa bảng kiểm bàn giao ISBAR, giám sát hô hấp và quản lý đau đa mô thức',
    type: 'QĐCK',
    typeName: 'Quy định chuyên môn bệnh viện',
    version: 'v1.0',
    author: 'ThSĐD. Hoàng Văn Dũng',
    department: 'Khoa Kiểm soát nhiễm khuẩn',
    departmentKey: 'infection',
    priority: 'Thường',
    currentStep: 4,
    status: 'Chờ HĐĐD',
    deadline: 'Còn 5 ngày',
    file: 'QDCK_BanGiao_HoiTinh.docx',
    fileSize: '1.5 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '25/01/2026',
    dateExpected: '2026-03-26',
    legalBasis: 'Khuyến cáo của Hội Gây mê Hồi sức Việt Nam và Thông tư 31/2021/TT-BYT.',
    councilScore: null
  },
  {
    id: 'QTKT-2026-009',
    code: 'QTKT-2026-009',
    title: 'Quy trình hút đờm qua ống nội khí quản kín ở người bệnh thở máy',
    desc: 'Quy trình sử dụng hệ thống hút kín vô khuẩn nhằm giảm thiểu nguy cơ viêm phổi thở máy (VAP)',
    type: 'QTKT',
    typeName: 'Quy trình kỹ thuật điều dưỡng',
    version: 'v1.0',
    author: 'ThS.ĐD Nguyễn An',
    department: 'Phòng Điều dưỡng Bệnh viện',
    departmentKey: 'nursing',
    priority: 'Khẩn',
    currentStep: 2,
    status: 'Đang soát xét',
    deadline: 'Còn 7 ngày',
    file: 'QTKT-2026-009_HutDomKin_v1.docx',
    fileSize: '2.4 MB',
    storageBucket: 'document-files/01_tai_lieu_chinh/',
    dateCreated: '01/02/2026',
    dateExpected: '2026-04-15',
    legalBasis: 'Thông tư 31/2021/TT-BYT; Khuyến cáo KSNK BV ĐHYD TP.HCM về phòng ngừa nhiễm khuẩn bệnh viện.',
    councilScore: null
  }
];

export class StorageService {
  constructor() {
    this._initStorage();
  }

  _initStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveAll(DEFAULT_RECORDS);
      }
    } catch (e) {
      console.warn('Không thể truy cập localStorage, sử dụng bộ nhớ tạm:', e);
      this._memoryData = [...DEFAULT_RECORDS];
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu:', e);
    }
    return this._memoryData || [...DEFAULT_RECORDS];
  }

  saveAll(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Lỗi ghi dữ liệu vào localStorage:', e);
      this._memoryData = records;
    }
  }

  getById(id) {
    const records = this.getAll();
    return records.find(r => r.id === id || r.code === id) || null;
  }

  add(record) {
    const records = this.getAll();
    if (!record.id) {
      record.id = record.code || this.generateNextCode(record.type || 'QTKT');
    }
    if (!record.code) {
      record.code = record.id;
    }
    records.unshift(record);
    this.saveAll(records);
    return record;
  }

  mergeBackendRecord(apiItem) {
    const records = this.getAll();
    const id = apiItem.id || apiItem.code;
    const existing = records.find(r => r.id === id || r.code === id || (r.title && r.title === apiItem.tieu_de));
    if (existing) {
      return false; // Đã tồn tại, bỏ qua trùng lặp
    }

    // Chuyển đổi cấu trúc từ bảng yeu_cau của Supabase sang đối tượng Record của Care Board
    const code = apiItem.metadata?.code || apiItem.code || `YC-${(apiItem.id || '').substring(0, 8).toUpperCase()}`;
    const newRecord = {
      id: apiItem.id || code,
      code: code,
      title: apiItem.tieu_de,
      desc: apiItem.noi_dung || 'Yêu cầu chuyên môn đồng bộ từ Database Supabase Cloud',
      type: apiItem.metadata?.type || 'QTKT',
      typeName: 'Hồ sơ chuyên môn (Đồng bộ Cloud)',
      version: apiItem.metadata?.version || 'v1.0',
      author: apiItem.nguoi_gui || 'Cán bộ Y tế',
      department: apiItem.khoa_phong || 'Khoa Lâm sàng',
      departmentKey: 'nursing',
      priority: apiItem.muc_do_uu_tien || 'Bình thường',
      currentStep: apiItem.trang_thai === 'Đã duyệt' ? 6 : (apiItem.trang_thai === 'Đang xử lý' ? 2 : 1),
      status: apiItem.trang_thai === 'Đã duyệt' ? 'Đã ban hành' : (apiItem.trang_thai === 'Đang xử lý' ? 'Đang soát xét' : 'Chờ tiếp nhận'),
      deadline: 'Theo chu kỳ',
      file: apiItem.metadata?.file || 'tai_lieu_chuyen_mon.docx',
      fileSize: '2.5 MB',
      storageBucket: 'document-files/01_tai_lieu_chinh/',
      dateCreated: apiItem.created_at ? new Date(apiItem.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      dateExpected: '2026-04-15',
      legalBasis: apiItem.ghi_chu || 'Đồng bộ tự động từ Supabase PostgREST Connection Pool',
      councilScore: null
    };

    records.unshift(newRecord);
    this.saveAll(records);
    return true;
  }

  update(id, updates) {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id || r.code === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      this.saveAll(records);
      return records[index];
    }
    return null;
  }

  delete(id) {
    let records = this.getAll();
    records = records.filter(r => r.id !== id && r.code !== id);
    this.saveAll(records);
    return true;
  }

  generateNextCode(type = 'QTKT') {
    const records = this.getAll();
    const year = new Date().getFullYear();
    const prefix = `${type}-${year}-`;
    
    let maxNum = 0;
    records.forEach(r => {
      if (r.code && r.code.startsWith(prefix)) {
        const numPart = parseInt(r.code.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });

    const nextNum = String(maxNum + 1).padStart(3, '0');
    return `${prefix}${nextNum}`;
  }

  resetToDefaults() {
    this.saveAll(DEFAULT_RECORDS);
    return [...DEFAULT_RECORDS];
  }

  getStats() {
    const records = this.getAll();
    const total = records.length;
    const needFeedback = records.filter(r => r.status === 'Cần bổ sung' || r.currentStep === 3).length;
    const published = records.filter(r => r.status === 'Đã ban hành' || r.currentStep === 6).length;
    const inCouncil = records.filter(r => r.status === 'Chờ HĐĐD' || r.currentStep === 4).length;
    const drafting = records.filter(r => r.status === 'Đang soạn thảo' || r.currentStep === 1).length;
    const reviewing = records.filter(r => r.status === 'Đang soát xét' || r.currentStep === 2).length;
    const completed = records.filter(r => r.status === 'Đã hoàn chỉnh' || r.currentStep === 5).length;

    return {
      total,
      needFeedback,
      published,
      inCouncil,
      drafting,
      reviewing,
      completed
    };
  }

  // --- QUẢN LÝ TÀI KHOẢN & XÁC THỰC (AUTHENTICATION) ---
  getCurrentUser() {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved === 'null' || saved === 'LOGGED_OUT') return null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Nếu chưa từng đăng nhập, mặc định null để hiển thị màn hình đăng nhập
    return null;
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.setItem(AUTH_KEY, 'LOGGED_OUT');
    }
  }

  login(emailOrId, password) {
    const term = (emailOrId || '').trim().toLowerCase();
    const user = DEMO_USERS.find(u => 
      u.email.toLowerCase() === term || 
      u.id.toLowerCase() === term ||
      u.email.toLowerCase().startsWith(term)
    );

    if (user) {
      this.setCurrentUser(user);
      return { success: true, user };
    }

    if (term.includes('@')) {
      const genericUser = {
        id: 'NV-' + Math.floor(10000 + Math.random() * 90000),
        name: term.split('@')[0].toUpperCase(),
        title: 'Cán bộ Y tế',
        position: 'Cán bộ Điều dưỡng',
        department: 'Khoa Lâm sàng',
        email: term,
        phone: 'Ext. 1080',
        role: 'author',
        avatar: 'assets/avatar.png'
      };
      this.setCurrentUser(genericUser);
      return { success: true, user: genericUser };
    }

    return { success: false, message: 'Tài khoản hoặc mã nhân sự không tồn tại trong hệ thống HR-HIS.' };
  }

  logout() {
    this.setCurrentUser(null);
  }
}

export const AUTH_KEY = 'CARE_BOARD_AUTH_USER_V1';

export const DEMO_USERS = [
  {
    id: 'NV-10824',
    name: 'ThSĐD. Trần Minh Thư',
    title: 'Thạc sĩ Điều dưỡng',
    position: 'Thư ký Hội đồng',
    fullPosition: 'Thư ký thường trực Hội đồng Điều dưỡng',
    department: 'Phòng Điều dưỡng - Cơ sở 1',
    email: 'dieuduong.truong@umc.edu.vn',
    password: 'Hospital@2026Secure',
    phone: 'Ext. 2045 (0918.***.245)',
    role: 'secretary',
    avatar: 'assets/avatar.png'
  },
  {
    id: 'NV-10952',
    name: 'ThSĐD. Nguyễn An',
    title: 'Điều dưỡng Trưởng Lâm sàng',
    position: 'Tác giả chuyên môn HSTC',
    fullPosition: 'Phụ trách chuyên môn Khoa Hồi sức tích cực',
    department: 'Khoa Hồi sức tích cực',
    email: 'nguyen.an@umc.edu.vn',
    password: 'Hospital@2026Secure',
    phone: 'Ext. 2088 (0903.***.112)',
    role: 'author',
    avatar: 'assets/avatar.png'
  },
  {
    id: 'NV-10001',
    name: 'PGS.TS.BS Trương Quang Bình',
    title: 'Phó Giám đốc Bệnh viện',
    position: 'Chủ tịch Hội đồng',
    fullPosition: 'Chủ tịch Hội đồng Điều dưỡng / Ban Giám đốc',
    department: 'Ban Giám đốc BV ĐHYD TP.HCM',
    email: 'tqbinh@umc.edu.vn',
    password: 'Hospital@2026Secure',
    phone: 'Ext. 1002 (0913.***.999)',
    role: 'secretary',
    avatar: 'assets/avatar.png'
  }
];

export const storage = new StorageService();

