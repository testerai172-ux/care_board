const fs = require('fs');

// ==========================================
// 1. DESKTOP TONG-QUAN
// ==========================================
function buildDesktopTongQuan() {
  const orig = fs.readFileSync('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html', 'utf8');

  // Let's add IDs without adding/removing any tags or classes
  let html = orig;

  // 1. User greeting in hero
  html = html.replace(
    'Chào buổi sáng, ThSĐD. Trần Minh Thư</h1>',
    'Chào buổi sáng, <span id="user-greeting-name">ThSĐD. Trần Minh Thư</span></h1>'
  );

  // 2. Urgent Card 1
  html = html.replace(
    'QTKT-2026-003: Chăm sóc dẫn lưu Kehr</h4>',
    '<span id="urgent-1-title">QTKT-2026-003: Chăm sóc dẫn lưu Kehr</span></h4>'
  );
  html = html.replace(
    'Khoa Ngoại Tiêu hoá • Đã có biên bản khoa</p>',
    '<span id="urgent-1-desc">Khoa Ngoại Tiêu hoá • Đã có biên bản khoa</span></p>'
  );
  html = html.replace(
    '<button class="px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Mở duyệt</span>',
    '<button id="urgent-1-btn" class="px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Mở duyệt</span>'
  );

  // Urgent Card 2
  html = html.replace(
    'HDCS-2026-007: Theo dõi tri giác thần kinh</h4>',
    '<span id="urgent-2-title">HDCS-2026-007: Theo dõi tri giác thần kinh</span></h4>'
  );
  html = html.replace(
    'Khoa Hồi sức Ngoại Thần kinh • Chờ giải trình</p>',
    '<span id="urgent-2-desc">Khoa Hồi sức Ngoại Thần kinh • Chờ giải trình</span></p>'
  );
  html = html.replace(
    '<button class="px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Đôn đốc</span>',
    '<button id="urgent-2-btn" class="px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Đôn đốc</span>'
  );

  // Urgent Card 3
  html = html.replace(
    'Thứ Năm, 26/03 (14:00 - 17:00)</h4>',
    '<span id="urgent-3-title">Thứ Năm, 26/03 (14:00 - 17:00)</span></h4>'
  );
  html = html.replace(
    'Phòng họp A • 05 hồ sơ thẩm định</p>',
    '<span id="urgent-3-desc">Phòng họp A • 05 hồ sơ thẩm định</span></p>'
  );
  html = html.replace(
    '<button class="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-teal-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Xem lịch</span>',
    '<button id="urgent-3-btn" class="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-teal-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Xem lịch</span>'
  );

  // 3. 5 KPI numbers
  html = html.replace(
    '<span class="text-3xl font-extrabold text-slate-900">30</span>',
    '<span class="text-3xl font-extrabold text-slate-900" id="kpi-total-plans">--</span>'
  );
  html = html.replace(
    '<span class="text-3xl font-extrabold text-amber-700">08</span>',
    '<span class="text-3xl font-extrabold text-amber-700" id="kpi-awaiting-review">--</span>'
  );
  html = html.replace(
    '<span class="text-3xl font-extrabold text-teal-700">05</span>',
    '<span class="text-3xl font-extrabold text-teal-700" id="kpi-in-council">--</span>'
  );
  html = html.replace(
    '<span class="text-3xl font-extrabold text-red-600">03</span>',
    '<span class="text-3xl font-extrabold text-red-600" id="kpi-needs-revision">--</span>'
  );
  html = html.replace(
    '<span class="text-3xl font-extrabold text-blue-900">14</span>',
    '<span class="text-3xl font-extrabold text-blue-900" id="kpi-promulgated">--</span>'
  );

  // 4. 6 Stages counters
  // Let's find the stage numbers
  // Stage 1..6 numbers in orig:
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">04</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-1-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">06</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-2-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">08</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-3-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">05</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-4-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">03</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-5-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );
  html = html.replace(
    '<span class="text-lg font-bold text-slate-800">14</span><span class="text-xs text-slate-400">hồ sơ</span>',
    '<span class="text-lg font-bold text-slate-800" id="stage-6-count">--</span><span class="text-xs text-slate-400">hồ sơ</span>'
  );

  // 5. Urgent tasks container
  html = html.replace(
    '<span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">4 hồ sơ chờ</span></div><div class="flex flex-col gap-3">',
    '<span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full" id="urgent-tasks-count">-- hồ sơ chờ</span></div><div class="flex flex-col gap-3" id="urgent-tasks-container">'
  );

  // 6. Upcoming meetings container
  html = html.replace(
    '<span class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Tháng 03/2026</span></div><div class="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">',
    '<span class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded" id="upcoming-meetings-month">Lịch gần nhất</span></div><div id="upcoming-meetings-container"><div class="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">'
  );
  // close container div: find where meetings container ends
  // Wait, let's wrap inside the parent or id the parent?
  // Let's inspect the parent of upcoming meetings card!
}
buildDesktopTongQuan();
console.log('Script built successfully');
