const fs = require('fs');

const orig = fs.readFileSync('frontend_mobile/mobile_t_ng_quan_dashboard_qu_n_tr/tong-quan.html', 'utf8');

let html = orig;

// 1. Header greeting (put id directly on h1)
html = html.replace(
  '<h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-primary mt-1 font-bold tracking-tight"> Chào buổi sáng, ThSĐD. Trần Minh Thư </h1>',
  '<h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-primary mt-1 font-bold tracking-tight" id="user-greeting"> Chào buổi sáng, ThSĐD. Trần Minh Thư </h1>'
);

// 2. Mobile total plan count
html = html.replace(
  '<span class="font-display-mobile text-display-mobile text-primary font-bold">30</span>',
  '<span class="font-display-mobile text-display-mobile text-primary font-bold" id="mobile-stat-total">30</span>'
);

// 3. Mobile 6 stage counts (if present)
// Let's check stage numbers in mobile orig
html = html.replace(
  '<span class="font-headline-sm text-headline-sm text-primary font-bold">04</span>',
  '<span class="font-headline-sm text-headline-sm text-primary font-bold" id="mobile-stage-1-count">04</span>'
);

// 4. Urgent tasks container
html = html.replace(
  '<button class="font-label-sm text-label-sm text-primary font-semibold flex items-center"> Xem tất cả (8) </button> </div>',
  '<button class="font-label-sm text-label-sm text-primary font-semibold flex items-center" id="mobile-tasks-count-btn"> Xem tất cả (8) </button> </div>'
);

// Container for urgent tasks in mobile
// Let's find container of Task Item 1
const task1Idx = html.indexOf('<!-- Task Item 1 -->');
if (task1Idx > -1) {
  const containerStart = html.lastIndexOf('<div class="px-gutter flex flex-col gap-space-sm">', task1Idx);
  if (containerStart > -1) {
    html = html.slice(0, containerStart) + '<div class="px-gutter flex flex-col gap-space-sm" id="mobile-tasks-container">' + html.slice(containerStart + '<div class="px-gutter flex flex-col gap-space-sm">'.length);
  }
}

// Add script after auth.js
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

  async function initMobileDashboard() {
    try {
      const me = await guardPage();
      const greetingEl = document.getElementById("user-greeting");
      if (greetingEl && me && me.display_name) {
        greetingEl.textContent = "Chào buổi sáng, " + me.display_name;
      }

      const { data: processes, error: pErr } = await sb
        .from("processes")
        .select("process_id, document_name, document_type, document_code, status, priority, stage, planned_council_date, review_deadline, units(unit_name), profiles(display_name), created_at")
        .order("created_at", { ascending: false });

      if (pErr) console.error("Lỗi tải processes mobile dashboard:", pErr);
      const allProc = processes || [];

      const totalEl = document.getElementById("mobile-stat-total");
      if (totalEl) totalEl.textContent = String(allProc.length).padStart(2, "0");

      const countBtn = document.getElementById("mobile-tasks-count-btn");
      if (countBtn) countBtn.textContent = \`Xem tất cả (\${allProc.length})\`;

      // Render tasks list by cloning sample card
      const tasksContainer = document.getElementById("mobile-tasks-container");
      if (tasksContainer && tasksContainer.firstElementChild) {
        const taskTemplate = tasksContainer.firstElementChild.cloneNode(true);
        const urgentTasks = allProc.slice(0, 5);

        tasksContainer.textContent = "";

        if (urgentTasks.length === 0) {
          const emptyDiv = document.createElement("div");
          emptyDiv.className = "p-4 text-center text-xs text-slate-500 bg-surface-container-lowest rounded-xl";
          emptyDiv.textContent = "Không có công việc nào cần xử lý gấp.";
          tasksContainer.appendChild(emptyDiv);
        } else {
          urgentTasks.forEach(task => {
            const card = taskTemplate.cloneNode(true);

            const codeSpan = card.querySelector(".text-primary-container");
            if (codeSpan) codeSpan.textContent = task.process_id || "N/A";

            const deadlineBadge = card.querySelector(".bg-tertiary-fixed");
            if (deadlineBadge) {
              const diff = getDaysDiff(task.review_deadline);
              deadlineBadge.textContent = diff !== null ? (diff >= 0 ? \`Cận hạn: \${diff} ngày\` : \`Quá hạn: \${Math.abs(diff)} ngày\`) : (task.status || "Chờ xử lý");
            }

            const titleH3 = card.querySelector("h3");
            if (titleH3) titleH3.textContent = task.document_name || "Chưa đặt tên";

            const metaSpan = card.querySelector(".text-on-surface-variant");
            if (metaSpan) {
              const u = task.units && task.units.unit_name ? task.units.unit_name : "Toàn viện";
              const author = task.profiles && task.profiles.display_name ? task.profiles.display_name : "Chuyên viên";
              metaSpan.textContent = \`\${u} • Tác giả: \${author}\`;
            }

            card.style.cursor = "pointer";
            card.onclick = () => {
              window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(task.process_id);
            };

            tasksContainer.appendChild(card);
          });
        }
      }
    } catch (err) {
      console.error("Lỗi Mobile Dashboard:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileDashboard);
  } else {
    initMobileDashboard();
  }
})();
</script>
`;

html = html.replace(authScriptTag, authScriptTag + dataScript);

fs.writeFileSync('frontend_mobile/tong-quan.html', html, 'utf8');
console.log('Successfully written frontend_mobile/tong-quan.html');

// Validate:
const checkBeforeAuth = html.slice(0, html.indexOf('../auth.js'));
const checkOrigBeforeAuth = orig.slice(0, orig.indexOf('../auth.js'));

const origTags = (checkOrigBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);
const curTags = (checkBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);

console.log('Mobile Orig tags before auth:', origTags.length);
console.log('Mobile Current tags before auth:', curTags.length);
console.log('Mobile Difference:', curTags.length - origTags.length);
