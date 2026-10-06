const fs = require('fs');

const orig = fs.readFileSync('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html', 'utf8');

let html = orig;

// 1. User greeting in hero
html = html.replace(
  'Chào buổi sáng, ThSĐD. Trần Minh Thư</h1>',
  'Chào buổi sáng, <span id="user-greeting-name">ThSĐD. Trần Minh Thư</span></h1>'
);

// 2. Urgent Card 1, 2, 3
html = html.replace(
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5">QTKT-2026-003: Chăm sóc dẫn lưu Kehr</h4>',
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5" id="urgent-1-title">QTKT-2026-003: Chăm sóc dẫn lưu Kehr</h4>'
);
html = html.replace(
  '<p class="text-xs text-slate-500 mt-0.5">Khoa Ngoại Tiêu hoá • Đã có biên bản khoa</p>',
  '<p class="text-xs text-slate-500 mt-0.5" id="urgent-1-desc">Khoa Ngoại Tiêu hoá • Đã có biên bản khoa</p>'
);
html = html.replace(
  '<button class="px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Mở duyệt</span>',
  '<button id="urgent-1-btn" class="px-3 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:bg-primary transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Mở duyệt</span>'
);

html = html.replace(
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5">HDCS-2026-007: Theo dõi tri giác thần kinh</h4>',
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5" id="urgent-2-title">HDCS-2026-007: Theo dõi tri giác thần kinh</h4>'
);
html = html.replace(
  '<p class="text-xs text-slate-500 mt-0.5">Khoa Hồi sức Ngoại Thần kinh • Chờ giải trình</p>',
  '<p class="text-xs text-slate-500 mt-0.5" id="urgent-2-desc">Khoa Hồi sức Ngoại Thần kinh • Chờ giải trình</p>'
);
html = html.replace(
  '<button class="px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Đôn đốc</span>',
  '<button id="urgent-2-btn" class="px-3 py-1.5 rounded-lg bg-error text-white text-xs font-semibold hover:bg-red-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Đôn đốc</span>'
);

html = html.replace(
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5">Thứ Năm, 26/03 (14:00 - 17:00)</h4>',
  '<h4 class="text-sm font-bold text-slate-800 mt-0.5" id="urgent-3-title">Thứ Năm, 26/03 (14:00 - 17:00)</h4>'
);
html = html.replace(
  '<p class="text-xs text-slate-500 mt-0.5">Phòng họp A • 05 hồ sơ thẩm định</p>',
  '<p class="text-xs text-slate-500 mt-0.5" id="urgent-3-desc">Phòng họp A • 05 hồ sơ thẩm định</p>'
);
html = html.replace(
  '<button class="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-teal-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Xem lịch</span>',
  '<button id="urgent-3-btn" class="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-teal-700 transition-colors shrink-0 shadow-xs flex items-center gap-1"><span class="">Xem lịch</span>'
);

// 3. 5 KPI numbers
html = html.replace(
  '<span class="text-3xl font-extrabold text-slate-900">30</span>',
  '<span class="text-3xl font-extrabold text-slate-900" id="kpi-total-plans">30</span>'
);
html = html.replace(
  '<span class="text-3xl font-extrabold text-amber-700">08</span>',
  '<span class="text-3xl font-extrabold text-amber-700" id="kpi-awaiting-review">08</span>'
);
html = html.replace(
  '<span class="text-3xl font-extrabold text-teal-700">05</span>',
  '<span class="text-3xl font-extrabold text-teal-700" id="kpi-in-council">05</span>'
);
html = html.replace(
  '<span class="text-3xl font-extrabold text-red-600">03</span>',
  '<span class="text-3xl font-extrabold text-red-600" id="kpi-needs-revision">03</span>'
);
html = html.replace(
  '<span class="text-3xl font-extrabold text-blue-900">14</span>',
  '<span class="text-3xl font-extrabold text-blue-900" id="kpi-promulgated">14</span>'
);

// 4. 6 Stages counters
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">04</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-1-count">04</span><span class="text-xs text-slate-400">hồ sơ</span>'
);
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">06</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-2-count">06</span><span class="text-xs text-slate-400">hồ sơ</span>'
);
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">08</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-3-count">08</span><span class="text-xs text-slate-400">hồ sơ</span>'
);
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">05</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-4-count">05</span><span class="text-xs text-slate-400">hồ sơ</span>'
);
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">03</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-5-count">03</span><span class="text-xs text-slate-400">hồ sơ</span>'
);
html = html.replace(
  '<span class="text-lg font-bold text-slate-800">14</span><span class="text-xs text-slate-400">hồ sơ</span>',
  '<span class="text-lg font-bold text-slate-800" id="stage-6-count">14</span><span class="text-xs text-slate-400">hồ sơ</span>'
);

// 5. Urgent tasks container
html = html.replace(
  '<span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">4 hồ sơ chờ</span></div><div class="flex flex-col gap-3">',
  '<span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full" id="urgent-tasks-count">4 hồ sơ chờ</span></div><div class="flex flex-col gap-3" id="urgent-tasks-container">'
);

// 6. Upcoming meeting card
html = html.replace(
  '<span class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Tháng 03/2026</span></div><div class="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">',
  '<span class="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded" id="upcoming-meeting-month">Tháng 03/2026</span></div><div class="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100" id="upcoming-meeting-card">'
);
html = html.replace(
  '<h4 class="text-sm font-bold text-slate-900 mt-0.5">Kỳ họp HĐĐD T03/2026</h4>',
  '<h4 class="text-sm font-bold text-slate-900 mt-0.5" id="upcoming-meeting-title">Kỳ họp HĐĐD T03/2026</h4>'
);
html = html.replace(
  '<span class="text-xs font-bold text-primary-container bg-white px-2 py-0.5 rounded border border-blue-200">Thứ 5, 26/03</span>',
  '<span class="text-xs font-bold text-primary-container bg-white px-2 py-0.5 rounded border border-blue-200" id="upcoming-meeting-date">Thứ 5, 26/03</span>'
);
html = html.replace(
  '<span class="block text-[11px] text-slate-500 mt-0.5">14:00 - 17:00</span>',
  '<span class="block text-[11px] text-slate-500 mt-0.5" id="upcoming-meeting-time">14:00 - 17:00</span>'
);
html = html.replace(
  '<span class="text-xs text-slate-500 font-medium">05 hồ sơ thẩm định</span>',
  '<span class="text-xs text-slate-500 font-medium" id="upcoming-meeting-docs">05 hồ sơ thẩm định</span>'
);

// 7. Activity log container
html = html.replace(
  '<span class="text-[11px] text-slate-400 font-mono">Real-time</span></div><div class="flex flex-col gap-3">',
  '<span class="text-[11px] text-slate-400 font-mono">Real-time</span></div><div class="flex flex-col gap-3" id="activity-log-container">'
);

// Now let's compare tag counts before auth.js
const origBeforeAuth = orig.slice(0, orig.indexOf('../auth.js'));
const newBeforeAuth = html.slice(0, html.indexOf('../auth.js'));

const origTags = (origBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);
const newTags = (newBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);

console.log('Orig tags before auth:', origTags.length);
console.log('New tags before auth:', newTags.length);

// Only 1 extra tag for user-greeting-name span if we wrapped it, OR if we put id on the h1 itself:
console.log('Diff:', newTags.length - origTags.length);
