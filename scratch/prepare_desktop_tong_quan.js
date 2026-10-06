const fs = require('fs');

const orig = fs.readFileSync('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html', 'utf8');

let html = orig;

// 1. User greeting in hero (put id directly on h1)
html = html.replace(
  '<h1 class="font-headline-lg text-headline-lg text-on-primary tracking-tight truncate">Chào buổi sáng, ThSĐD. Trần Minh Thư</h1>',
  '<h1 class="font-headline-lg text-headline-lg text-on-primary tracking-tight truncate" id="user-greeting">Chào buổi sáng, ThSĐD. Trần Minh Thư</h1>'
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

// Add JavaScript logic after auth.js
const authScriptTag = '<script src="../auth.js"></script>';
const dataScript = `
<script id="dashboard-data-script">
(function() {
  function formatDate(dStr) {
    if (!dStr) return "Chưa ấn định";
    const parts = String(dStr).split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return \`\${parts[2].slice(0, 2)}/\${parts[1]}/\${parts[0]}\`;
    }
    const dt = new Date(dStr);
    if (isNaN(dt.getTime())) return String(dStr);
    const d = String(dt.getDate()).padStart(2, "0");
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const y = dt.getFullYear();
    return \`\${d}/\${m}/\${y}\`;
  }

  function getDaysDiff(dStr) {
    if (!dStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dStr);
    if (isNaN(target.getTime())) return null;
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  }

  async function initDashboard() {
    try {
      const me = await guardPage();
      const greetingEl = document.getElementById("user-greeting");
      if (greetingEl && me && me.display_name) {
        greetingEl.textContent = "Chào buổi sáng, " + me.display_name;
      }

      // 1. Tải danh sách hồ sơ quy trình
      const { data: processes, error: pErr } = await sb
        .from("processes")
        .select("process_id, document_name, document_type, document_code, status, priority, stage, planned_council_date, review_deadline, units(unit_name), profiles(display_name), created_at")
        .order("created_at", { ascending: false });

      if (pErr) {
        console.error("Lỗi truy vấn hồ sơ dashboard:", pErr);
      }

      const allProc = processes || [];

      // Tính toán 5 chỉ số KPI
      const kpiTotal = allProc.length;
      const kpiReview = allProc.filter(p => p.stage === 2 || p.stage === 3 || (p.status || "").toLowerCase().includes("soát xét") || (p.status || "").toLowerCase().includes("thẩm định")).length;
      const kpiCouncil = allProc.filter(p => p.stage === 4 || (p.status || "").toLowerCase().includes("hội đồng")).length;
      const kpiRevision = allProc.filter(p => p.stage === 5 || (p.status || "").toLowerCase().includes("bổ sung") || (p.status || "").toLowerCase().includes("chỉnh sửa")).length;
      const kpiPromulgated = allProc.filter(p => p.stage === 6 || (p.status || "").toLowerCase().includes("ban hành")).length;

      const setNum = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(val).padStart(2, "0");
      };

      setNum("kpi-total-plans", kpiTotal);
      setNum("kpi-awaiting-review", kpiReview);
      setNum("kpi-in-council", kpiCouncil);
      setNum("kpi-needs-revision", kpiRevision);
      setNum("kpi-promulgated", kpiPromulgated);

      // Đếm số lượng theo 6 giai đoạn
      const stageCounts = [0, 0, 0, 0, 0, 0];
      allProc.forEach(p => {
        const st = Number(p.stage);
        if (st >= 1 && st <= 6) {
          stageCounts[st - 1]++;
        }
      });
      for (let i = 1; i <= 6; i++) {
        setNum("stage-" + i + "-count", stageCounts[i - 1]);
      }

      // Cập nhật 3 Thẻ khẩn cấp ở đầu trang
      // Urgent 1: Hồ sơ ưu tiên Cao hoặc cận hạn
      const urgent1 = allProc.find(p => (p.priority || "").toLowerCase() === "cao" || p.review_deadline);
      if (urgent1) {
        const u1Title = document.getElementById("urgent-1-title");
        if (u1Title) u1Title.textContent = (urgent1.process_id || "") + ": " + (urgent1.document_name || "");
        const u1Desc = document.getElementById("urgent-1-desc");
        const u1Days = getDaysDiff(urgent1.review_deadline);
        const u1Unit = urgent1.units && urgent1.units.unit_name ? urgent1.units.unit_name : "Toàn viện";
        if (u1Desc) {
          u1Desc.textContent = u1Unit + (u1Days !== null ? (" • " + (u1Days >= 0 ? \`Còn \${u1Days} ngày\` : \`Quá hạn \${Math.abs(u1Days)} ngày\`)) : "");
        }
        const u1Btn = document.getElementById("urgent-1-btn");
        if (u1Btn) {
          u1Btn.onclick = () => window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(urgent1.process_id);
        }
      }

      // Urgent 2: Hồ sơ cần giải trình / bổ sung / quá hạn
      const urgent2 = allProc.find(p => p.stage === 5 || (p.status || "").toLowerCase().includes("bổ sung") || (p.status || "").toLowerCase().includes("chỉnh sửa")) || allProc[1];
      if (urgent2) {
        const u2Title = document.getElementById("urgent-2-title");
        if (u2Title) u2Title.textContent = (urgent2.process_id || "") + ": " + (urgent2.document_name || "");
        const u2Desc = document.getElementById("urgent-2-desc");
        const u2Unit = urgent2.units && urgent2.units.unit_name ? urgent2.units.unit_name : "Khoa chuyên môn";
        if (u2Desc) u2Desc.textContent = u2Unit + " • Trạng thái: " + (urgent2.status || "Chờ xử lý");
        const u2Btn = document.getElementById("urgent-2-btn");
        if (u2Btn) {
          u2Btn.onclick = () => window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(urgent2.process_id);
        }
      }

      // Urgent 3: Lịch họp HĐĐD sắp tới
      const urgent3 = allProc.find(p => p.planned_council_date);
      if (urgent3) {
        const u3Title = document.getElementById("urgent-3-title");
        if (u3Title) u3Title.textContent = "Họp HĐ: " + formatDate(urgent3.planned_council_date);
        const u3Desc = document.getElementById("urgent-3-desc");
        if (u3Desc) u3Desc.textContent = "Hồ sơ: " + (urgent3.process_id || "") + " • " + (urgent3.document_name || "");
        const u3Btn = document.getElementById("urgent-3-btn");
        if (u3Btn) {
          u3Btn.onclick = () => window.location.href = "lich-hop-hoi-dong.html";
        }
      }

      // 2. Nhân bản dòng mẫu: Công việc cần xử lý ngay
      const urgentTasksContainer = document.getElementById("urgent-tasks-container");
      const urgentTasksCountEl = document.getElementById("urgent-tasks-count");
      if (urgentTasksContainer && urgentTasksContainer.firstElementChild) {
        const taskTemplate = urgentTasksContainer.firstElementChild.cloneNode(true);
        const pendingTasks = allProc.filter(p => p.stage < 6).slice(0, 5);

        if (urgentTasksCountEl) {
          urgentTasksCountEl.textContent = pendingTasks.length + " hồ sơ chờ";
        }

        urgentTasksContainer.textContent = "";

        if (pendingTasks.length === 0) {
          const emptyDiv = document.createElement("div");
          emptyDiv.className = "p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200";
          emptyDiv.textContent = "Hiện không có công việc nào cần xử lý gấp.";
          urgentTasksContainer.appendChild(emptyDiv);
        } else {
          pendingTasks.forEach(task => {
            const card = taskTemplate.cloneNode(true);

            const codeSpan = card.querySelector(".bg-primary-container");
            if (codeSpan) codeSpan.textContent = task.process_id || "N/A";

            const badgeSpan = card.querySelector(".bg-amber-100");
            if (badgeSpan) {
              const diff = getDaysDiff(task.review_deadline);
              badgeSpan.textContent = diff !== null ? (diff >= 0 ? \`Cận hạn: \${diff} ngày\` : \`Quá hạn: \${Math.abs(diff)} ngày\`) : (task.status || "Chờ xử lý");
            }

            const unitSpan = card.querySelector(".text-slate-500");
            if (unitSpan) {
              unitSpan.textContent = (task.units && task.units.unit_name ? task.units.unit_name : "Toàn viện");
            }

            const timeSpan = card.querySelector(".text-slate-400");
            if (timeSpan) {
              timeSpan.textContent = formatDate(task.created_at);
            }

            const titleH4 = card.querySelector("h4");
            if (titleH4) titleH4.textContent = task.document_name || "Chưa đặt tên";

            const metaP = card.querySelector("p");
            if (metaP) {
              const author = task.profiles && task.profiles.display_name ? task.profiles.display_name : "Chuyên viên";
              const type = task.document_type || "Quy trình";
              metaP.textContent = \`Tác giả: \${author} • Loại: \${type}\`;
            }

            card.style.cursor = "pointer";
            card.onclick = () => {
              window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(task.process_id);
            };

            urgentTasksContainer.appendChild(card);
          });
        }
      }

      // 3. Cập nhật thẻ Lịch họp HĐĐD sắp tới
      const upcomingMeetingCard = document.getElementById("upcoming-meeting-card");
      if (upcomingMeetingCard) {
        const nextMeetingProc = allProc.find(p => p.planned_council_date);
        if (nextMeetingProc) {
          const mTitle = document.getElementById("upcoming-meeting-title");
          if (mTitle) mTitle.textContent = "Kỳ họp thẩm định: " + (nextMeetingProc.process_id || "");
          const mDate = document.getElementById("upcoming-meeting-date");
          if (mDate) mDate.textContent = formatDate(nextMeetingProc.planned_council_date);
          const mDocs = document.getElementById("upcoming-meeting-docs");
          if (mDocs) mDocs.textContent = "HS: " + (nextMeetingProc.document_name || "");
        }
      }

      // 4. Nhân bản dòng mẫu: Nhật ký hoạt động
      const activityLogContainer = document.getElementById("activity-log-container");
      if (activityLogContainer && activityLogContainer.firstElementChild) {
        const logTemplate = activityLogContainer.firstElementChild.cloneNode(true);

        const { data: reviews } = await sb
          .from("ai_reviews")
          .select("id, process_id, reviewed_at, issue_count, summary, processes(document_name)")
          .order("reviewed_at", { ascending: false })
          .limit(4);

        const logItems = reviews || [];
        if (logItems.length > 0) {
          activityLogContainer.textContent = "";
          logItems.forEach(item => {
            const row = logTemplate.cloneNode(true);
            const avatar = row.querySelector(".rounded-full");
            if (avatar) avatar.textContent = "AI";

            const nameEl = row.querySelector(".truncate");
            if (nameEl) nameEl.textContent = "AI Soát xét tự động";

            const timeEl = row.querySelector(".text-slate-400");
            if (timeEl) timeEl.textContent = formatDate(item.reviewed_at);

            const descP = row.querySelector("p");
            if (descP) {
              const docName = item.processes && item.processes.document_name ? item.processes.document_name : item.process_id;
              descP.textContent = \`Đã soát xét \${item.process_id} (\${docName}): phát hiện \${item.issue_count || 0} điểm lưu ý.\`;
            }
            activityLogContainer.appendChild(row);
          });
        }
      }

    } catch (err) {
      console.error("Lỗi khởi tạo Dashboard:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDashboard);
  } else {
    initDashboard();
  }
})();
</script>
`;

html = html.replace(authScriptTag, authScriptTag + dataScript);

fs.writeFileSync('frontend_desktop/tong-quan.html', html, 'utf8');
console.log('Successfully written frontend_desktop/tong-quan.html');

// Validate:
const checkBeforeAuth = html.slice(0, html.indexOf('../auth.js'));
const checkOrigBeforeAuth = orig.slice(0, orig.indexOf('../auth.js'));

const origTags = (checkOrigBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);
const curTags = (checkBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);

console.log('Original tags count before auth:', origTags.length);
console.log('Current tags count before auth:', curTags.length);
console.log('Difference:', curTags.length - origTags.length);
