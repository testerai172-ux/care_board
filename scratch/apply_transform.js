const fs = require('fs');

const filePath = 'frontend_mobile/lich-hop-hoi-dong.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Update header cancellation badge count
const targetBadge = 'Lưu vết hủy</span><span class="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold leading-none">1</span>';
const replaceBadge = 'Lưu vết hủy</span><span class="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold leading-none" id="cancellation-badge-count">--</span>';
if (!html.includes(targetBadge)) throw new Error('targetBadge not found');
html = html.replace(targetBadge, replaceBadge);

// 2. Update 4 stat cards
// Stat 1: Lịch sắp diễn ra
const targetStat1 = 'Lịch sắp diễn ra</span><div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary"><span class="material-symbols-outlined text-[18px]">calendar_today</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-primary font-bold">03</span>';
const replaceStat1 = 'Lịch sắp diễn ra</span><div class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-secondary"><span class="material-symbols-outlined text-[18px]">calendar_today</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-primary font-bold" id="stat-upcoming-count">--</span>';
if (!html.includes(targetStat1)) throw new Error('targetStat1 not found');
html = html.replace(targetStat1, replaceStat1);

// Stat 2: Chờ duyệt lịch
const targetStat2 = 'Chờ duyệt lịch</span><div class="w-7 h-7 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary-container"><span class="material-symbols-outlined text-[18px]">pending_actions</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-tertiary-container font-bold">02</span>';
const replaceStat2 = 'Chờ duyệt lịch</span><div class="w-7 h-7 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary-container"><span class="material-symbols-outlined text-[18px]">pending_actions</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-tertiary-container font-bold" id="stat-pending-count">--</span>';
if (!html.includes(targetStat2)) throw new Error('targetStat2 not found');
html = html.replace(targetStat2, replaceStat2);

// Stat 3: Đã hoàn thành
const targetStat3 = 'Đã hoàn thành</span><div class="w-7 h-7 rounded-lg bg-secondary-container/50 flex items-center justify-center text-primary-container"><span class="material-symbols-outlined text-[18px]">task_alt</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-primary font-bold">18</span>';
const replaceStat3 = 'Đã hoàn thành</span><div class="w-7 h-7 rounded-lg bg-secondary-container/50 flex items-center justify-center text-primary-container"><span class="material-symbols-outlined text-[18px]">task_alt</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-primary font-bold" id="stat-approved-count">--</span>';
if (!html.includes(targetStat3)) throw new Error('targetStat3 not found');
html = html.replace(targetStat3, replaceStat3);

// Stat 4: Đã hủy / dời lịch
const targetStat4 = 'Đã hủy / dời lịch</span><div class="w-7 h-7 rounded-lg bg-error-container/60 flex items-center justify-center text-error"><span class="material-symbols-outlined text-[18px]">event_busy</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-error font-bold">01</span>';
const replaceStat4 = 'Đã hủy / dời lịch</span><div class="w-7 h-7 rounded-lg bg-error-container/60 flex items-center justify-center text-error"><span class="material-symbols-outlined text-[18px]">event_busy</span></div></div><div class="mt-space-xs flex items-baseline gap-1"><span class="font-headline-lg text-headline-lg text-error font-bold" id="stat-cancelled-count">--</span>';
if (!html.includes(targetStat4)) throw new Error('targetStat4 not found');
html = html.replace(targetStat4, replaceStat4);

// 3. Update filter tabs with counters and data-filter
const targetTabs = '<div class="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5"><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-primary text-on-primary font-label-md text-label-md shrink-0 flex items-center gap-1 shadow-sm transition-colors" onclick="filterMeetings(\'all\', this)"><span class="">Tất cả</span><span class="opacity-80">(5)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" onclick="filterMeetings(\'upcoming\', this)"><span class="">Sắp diễn ra</span><span class="opacity-80">(3)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" onclick="filterMeetings(\'pending\', this)"><span class="">Chờ duyệt</span><span class="opacity-80">(2)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" onclick="filterMeetings(\'done\', this)"><span class="">Đã xong</span><span class="opacity-80">(18)</span></button></div>';
const replaceTabs = '<div class="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5"><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-primary text-on-primary font-label-md text-label-md shrink-0 flex items-center gap-1 shadow-sm transition-colors" data-filter="all" onclick="filterMeetings(\'all\', this)"><span class="">Tất cả</span><span class="opacity-80" id="count-all">(--)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" data-filter="upcoming" onclick="filterMeetings(\'upcoming\', this)"><span class="">Sắp diễn ra</span><span class="opacity-80" id="count-upcoming">(--)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" data-filter="pending" onclick="filterMeetings(\'pending\', this)"><span class="">Chờ duyệt</span><span class="opacity-80" id="count-pending">(--)</span></button><button class="filter-tab min-h-[38px] px-space-md rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md shrink-0 flex items-center gap-1 transition-colors" data-filter="done" onclick="filterMeetings(\'done\', this)"><span class="">Đã xong</span><span class="opacity-80" id="count-done">(--)</span></button></div>';
if (!html.includes(targetTabs)) throw new Error('targetTabs not found');
html = html.replace(targetTabs, replaceTabs);

// 4. Update meetings container inner content
const pStart = html.indexOf('<div class="px-gutter pt-space-md flex flex-col gap-space-md" id="meetings-container">');
const pEnd = html.indexOf('<div class="px-gutter pt-space-lg pb-space-lg flex flex-col gap-space-sm"><details class="group bg-surface-container-lowest');
if (pStart === -1 || pEnd === -1) throw new Error('meetings container boundary not found');

const beforeContainer = html.substring(0, pStart);
const afterContainer = html.substring(pEnd);
const newContainerHtml = '<div class="px-gutter pt-space-md flex flex-col gap-space-md" id="meetings-container"><div class="p-8 text-center text-slate-500 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm font-medium border border-outline-variant/20" id="meetings-loading-state"><span class="material-symbols-outlined text-[22px] animate-spin text-primary">progress_activity</span><span>Đang tải lịch họp Hội đồng...</span></div></div>';

html = beforeContainer + newContainerHtml + afterContainer;

// 5. Update cancellation log section count
const targetCancSec = 'Biên bản hủy / chuyển lịch gần đây</h3></div><span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">1 hồ sơ</span>';
const replaceCancSec = 'Biên bản hủy / chuyển lịch gần đây</h3></div><span class="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold" id="cancellation-section-count">-- hồ sơ</span>';
if (!html.includes(targetCancSec)) throw new Error('targetCancSec not found');
html = html.replace(targetCancSec, replaceCancSec);

// 6. Append script after ../auth.js
const targetAuth = '<script src="../auth.js"></script>';
const scheduleScript = `<script src="../auth.js"></script>
<script id="council-schedule-script">
(function() {
  let allProcesses = [];
  let councilMap = {};
  let currentFilter = "all";
  let searchKeyword = "";

  // Định dạng ngày theo dd/mm/yyyy
  function formatDate(dStr) {
    if (!dStr) return "Chưa ấn định";
    const parts = String(dStr).split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const y = parts[0];
      const m = parts[1].padStart(2, "0");
      const d = parts[2].substring(0, 2).padStart(2, "0");
      return \`\${d}/\${m}/\${y}\`;
    }
    const dt = new Date(dStr);
    if (isNaN(dt.getTime())) return String(dStr);
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return \`\${day}/\${month}/\${year}\`;
  }

  // Lấy thứ trong tuần tiếng Việt
  function getDayOfWeek(dStr) {
    if (!dStr) return "";
    const parts = String(dStr).split("-");
    if (parts.length === 3) {
      const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2].substring(0, 2)));
      const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      return days[dt.getDay()] || "";
    }
    return "";
  }

  // Ánh xạ kết quả thẩm định theo quy định
  function getResultInfo(res) {
    if (!res) {
      return {
        text: "Chờ thẩm định",
        badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
        icon: "schedule"
      };
    }
    if (res.result === "approved") {
      return {
        text: "Thông qua",
        badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        icon: "check_circle"
      };
    }
    if (res.result === "approved_with_revision") {
      return {
        text: "Thông qua có chỉnh sửa",
        badgeClass: "bg-amber-100 text-amber-800 border border-amber-300",
        icon: "edit_note"
      };
    }
    if (res.result === "rejected") {
      return {
        text: "Không thông qua",
        badgeClass: "bg-rose-100 text-rose-800 border border-rose-300",
        icon: "cancel"
      };
    }
    return {
      text: res.result || "Đã có kết quả",
      badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
      icon: "info"
    };
  }

  // Chờ guardPage() xong (dùng window.CURRENT_USER)
  async function waitForAuth() {
    if (window.CURRENT_USER) return window.CURRENT_USER;
    if (typeof guardPage === "function") {
      try {
        const u = await guardPage();
        if (u) return u;
      } catch (e) {
        console.error("Lỗi khi chạy guardPage:", e);
      }
    }
    return new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", async () => {
        if (typeof guardPage === "function") {
          try {
            const u = await guardPage();
            resolve(u || window.CURRENT_USER);
          } catch (e) {
            console.error("Lỗi guardPage khi DOMContentLoaded:", e);
            resolve(window.CURRENT_USER);
          }
        } else {
          resolve(window.CURRENT_USER);
        }
      });
    });
  }

  // Tạo phần tử loading
  function createLoadingEl(text) {
    const wrap = document.createElement("div");
    wrap.className = "p-8 text-center text-slate-500 bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm font-medium border border-outline-variant/20";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-[22px] animate-spin text-primary";
    icon.textContent = "progress_activity";
    const span = document.createElement("span");
    span.textContent = text || "Đang tải lịch họp Hội đồng...";
    wrap.appendChild(icon);
    wrap.appendChild(span);
    return wrap;
  }

  // Tạo phần tử empty
  function createEmptyEl(text) {
    const wrap = document.createElement("div");
    wrap.className = "p-10 text-center text-slate-500 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-2 text-sm font-medium";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-[36px] text-outline";
    icon.textContent = "event_busy";
    const span = document.createElement("span");
    span.textContent = text || "Không có phiên họp nào theo kế hoạch";
    wrap.appendChild(icon);
    wrap.appendChild(span);
    return wrap;
  }

  // Tạo phần tử error
  function createErrorEl(text) {
    const wrap = document.createElement("div");
    wrap.className = "p-6 text-center text-error bg-error-container/30 rounded-xl border border-error/20 flex items-center justify-center gap-2 text-sm font-medium";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-[20px] text-error";
    icon.textContent = "error";
    const span = document.createElement("span");
    span.textContent = text || "Đã xảy ra lỗi khi tải dữ liệu lịch họp. Vui lòng thử lại sau.";
    wrap.appendChild(icon);
    wrap.appendChild(span);
    return wrap;
  }

  // Tạo phần tử hồ sơ đơn lẻ bên trong ngày họp (Mobile layout)
  function createProcessItem(proc, councilRes) {
    const item = document.createElement("div");
    item.className = "p-space-sm rounded-xl bg-surface-container/40 border border-outline-variant/30 flex flex-col gap-2 transition-all";

    // Hàng tiêu đề: Mã quy trình, Đơn vị, Trạng thái quy trình, Nhãn kết quả
    const headerRow = document.createElement("div");
    headerRow.className = "flex flex-wrap items-center justify-between gap-1.5";

    const leftBadges = document.createElement("div");
    leftBadges.className = "flex flex-wrap items-center gap-1.5";

    const codeBadge = document.createElement("span");
    codeBadge.className = "px-2 py-0.5 rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-bold";
    codeBadge.textContent = proc.process_id || "Chưa có mã";
    leftBadges.appendChild(codeBadge);

    const unitName = proc.units && proc.units.unit_name ? proc.units.unit_name : "";
    if (unitName) {
      const unitBadge = document.createElement("span");
      unitBadge.className = "px-2 py-0.5 rounded-md bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/30";
      unitBadge.textContent = unitName;
      leftBadges.appendChild(unitBadge);
    }

    if (proc.status) {
      const statusBadge = document.createElement("span");
      statusBadge.className = "px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm";
      statusBadge.textContent = proc.status;
      leftBadges.appendChild(statusBadge);
    }
    headerRow.appendChild(leftBadges);

    // Nhãn kết quả thẩm định
    const resInfo = getResultInfo(councilRes);
    const resBadge = document.createElement("span");
    resBadge.className = \`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 shrink-0 \${resInfo.badgeClass}\`;
    const resIcon = document.createElement("span");
    resIcon.className = "material-symbols-outlined text-[15px]";
    resIcon.textContent = resInfo.icon;
    resBadge.appendChild(resIcon);
    const resText = document.createElement("span");
    resText.textContent = resInfo.text;
    resBadge.appendChild(resText);
    headerRow.appendChild(resBadge);

    item.appendChild(headerRow);

    // Tên quy trình / tài liệu
    const docTitle = document.createElement("h3");
    docTitle.className = "font-headline-sm text-[14px] font-bold text-on-surface leading-snug";
    docTitle.textContent = proc.document_name || "Chưa đặt tên tài liệu";
    item.appendChild(docTitle);

    // Chi tiết kết quả họp Hội đồng nếu có
    if (councilRes) {
      const detailBox = document.createElement("div");
      detailBox.className = "text-xs text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex flex-col gap-1";

      const metaRow = document.createElement("div");
      metaRow.className = "flex items-center gap-2 flex-wrap text-outline font-medium text-[11px]";

      if (councilRes.meeting_date) {
        const mDate = document.createElement("span");
        mDate.textContent = \`Ngày họp: \${formatDate(councilRes.meeting_date)}\`;
        metaRow.appendChild(mDate);
      }
      if (councilRes.revision_required && councilRes.revision_deadline) {
        const rDead = document.createElement("span");
        rDead.className = "text-amber-800 font-semibold";
        rDead.textContent = \`Hạn sửa: \${formatDate(councilRes.revision_deadline)}\`;
        metaRow.appendChild(rDead);
      }
      detailBox.appendChild(metaRow);

      if (councilRes.general_comment) {
        const commentP = document.createElement("p");
        commentP.className = "italic text-on-surface-variant text-[12px] pt-0.5";
        commentP.textContent = \`“\${councilRes.general_comment}”\`;
        detailBox.appendChild(commentP);
      }
      item.appendChild(detailBox);
    }

    // Nút mở kho tài liệu & Chi tiết
    const actionRow = document.createElement("div");
    actionRow.className = "flex items-center justify-between pt-1 flex-wrap gap-2";

    const linkWorkspace = document.createElement("a");
    linkWorkspace.href = \`khong-gian-tai-lieu.html?process_id=\${encodeURIComponent(proc.process_id)}\`;
    linkWorkspace.className = "min-h-[36px] px-space-sm py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 transition-colors border border-outline-variant/30";
    const docIcon = document.createElement("span");
    docIcon.className = "material-symbols-outlined text-[16px]";
    docIcon.textContent = "folder_open";
    linkWorkspace.appendChild(docIcon);
    const linkText = document.createElement("span");
    linkText.textContent = "Kho tài liệu";
    linkWorkspace.appendChild(linkText);
    actionRow.appendChild(linkWorkspace);

    const btnDetail = document.createElement("button");
    btnDetail.type = "button";
    btnDetail.className = "min-h-[36px] px-space-sm py-1 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all";
    const eyeIcon = document.createElement("span");
    eyeIcon.className = "material-symbols-outlined text-[16px]";
    eyeIcon.textContent = "visibility";
    btnDetail.appendChild(eyeIcon);
    const eyeText = document.createElement("span");
    eyeText.textContent = "Chi tiết";
    btnDetail.appendChild(eyeText);
    btnDetail.addEventListener("click", () => {
      if (typeof viewMeetingDetail === "function") {
        viewMeetingDetail(proc.process_id);
      } else {
        alert("Chi tiết hồ sơ: " + proc.process_id);
      }
    });
    actionRow.appendChild(btnDetail);

    item.appendChild(actionRow);
    return item;
  }

  // Tạo thẻ phiên họp theo ngày (Day Session Card - Mobile layout)
  function createDaySessionCard(dateStr, processList, map) {
    const card = document.createElement("article");
    card.className = "meeting-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm border-l-4 border-primary";

    // Tiêu đề ngày họp
    const topRow = document.createElement("div");
    topRow.className = "flex items-center justify-between gap-space-xs pb-space-xs border-b border-surface-container/60";

    const leftDate = document.createElement("div");
    leftDate.className = "flex items-center gap-space-xs";

    const calIcon = document.createElement("span");
    calIcon.className = "material-symbols-outlined text-[18px] text-primary";
    calIcon.textContent = "event";
    leftDate.appendChild(calIcon);

    const dateTitle = document.createElement("h2");
    dateTitle.className = "font-headline-sm text-headline-sm text-primary font-bold leading-tight";
    const dow = getDayOfWeek(dateStr);
    dateTitle.textContent = \`\${formatDate(dateStr)}\${dow ? \` (\${dow})\` : ""}\`;
    leftDate.appendChild(dateTitle);

    topRow.appendChild(leftDate);

    const countBadge = document.createElement("span");
    countBadge.className = "px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-bold shrink-0";
    countBadge.textContent = \`\${processList.length} hồ sơ\`;
    topRow.appendChild(countBadge);

    card.appendChild(topRow);

    // Hộp thông tin phiên họp
    const sessionInfo = document.createElement("div");
    sessionInfo.className = "p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5";

    const sessionTime = document.createElement("div");
    sessionTime.className = "flex items-start gap-space-xs text-on-surface";
    const timeIcon = document.createElement("span");
    timeIcon.className = "material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5";
    timeIcon.textContent = "schedule";
    sessionTime.appendChild(timeIcon);
    const timeText = document.createElement("div");
    timeText.className = "font-body-sm text-body-sm";
    const timeStrong = document.createElement("strong");
    timeStrong.className = "font-semibold text-primary";
    timeStrong.textContent = "Phiên họp Hội đồng Điều dưỡng";
    timeText.appendChild(timeStrong);
    sessionTime.appendChild(timeText);
    sessionInfo.appendChild(sessionTime);

    const sessionRoom = document.createElement("div");
    sessionRoom.className = "flex items-start gap-space-xs text-on-surface";
    const roomIcon = document.createElement("span");
    roomIcon.className = "material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5";
    roomIcon.textContent = "meeting_room";
    sessionRoom.appendChild(roomIcon);
    const roomText = document.createElement("div");
    roomText.className = "font-body-sm text-body-sm text-on-surface-variant";
    roomText.textContent = "Phòng giao ban P. Điều dưỡng & Trực tuyến Hybrid";
    sessionRoom.appendChild(roomText);
    sessionInfo.appendChild(sessionRoom);

    card.appendChild(sessionInfo);

    // Danh sách hồ sơ trong ngày
    const procContainer = document.createElement("div");
    procContainer.className = "flex flex-col gap-space-sm pt-1";

    processList.forEach(proc => {
      const procEl = createProcessItem(proc, map[proc.process_id]);
      procContainer.appendChild(procEl);
    });

    card.appendChild(procContainer);
    return card;
  }

  // Cập nhật số liệu thống kê và bộ đếm tab
  function updateStatsAndCounts() {
    const total = allProcesses.length;
    let upcoming = 0;
    let completed = 0;
    let approved = 0;
    let cancelled = 0;

    allProcesses.forEach(p => {
      const cr = councilMap[p.process_id];
      if (cr) {
        completed++;
        if (cr.result === "approved") {
          approved++;
        }
      } else {
        upcoming++;
      }
      const st = (p.status || "").toLowerCase();
      if (st.includes("hủy") || st.includes("huy")) {
        cancelled++;
      }
    });

    const statUp = document.getElementById("stat-upcoming-count");
    if (statUp) statUp.textContent = String(upcoming).padStart(2, "0");

    const statPend = document.getElementById("stat-pending-count");
    if (statPend) statPend.textContent = String(upcoming).padStart(2, "0");

    const statComp = document.getElementById("stat-completed-count");
    if (statComp) statComp.textContent = String(completed).padStart(2, "0");

    const statApp = document.getElementById("stat-approved-count");
    if (statApp) statApp.textContent = String(approved).padStart(2, "0");

    const statCanc = document.getElementById("stat-cancelled-count");
    if (statCanc) statCanc.textContent = String(cancelled).padStart(2, "0");

    const countAll = document.getElementById("count-all");
    if (countAll) countAll.textContent = \`(\${total})\`;

    const countUp = document.getElementById("count-upcoming");
    if (countUp) countUp.textContent = \`(\${upcoming})\`;

    const countPend = document.getElementById("count-pending");
    if (countPend) countPend.textContent = \`(\${upcoming})\`;

    const countDone = document.getElementById("count-done");
    if (countDone) countDone.textContent = \`(\${completed})\`;

    const cancBadge = document.getElementById("cancellation-badge-count");
    if (cancBadge) cancBadge.textContent = String(cancelled);

    const cancSec = document.getElementById("cancellation-section-count");
    if (cancSec) cancSec.textContent = \`\${cancelled} hồ sơ\`;
  }

  // Vẽ danh sách các phiên họp gom theo planned_council_date
  function renderMeetingCards() {
    const container = document.getElementById("meetings-container");
    if (!container) return;

    // Lọc theo bộ lọc và từ khóa tìm kiếm
    const filtered = allProcesses.filter(p => {
      if (searchKeyword) {
        const pCode = (p.process_id || "").toLowerCase();
        const pName = (p.document_name || "").toLowerCase();
        const uName = (p.units && p.units.unit_name ? p.units.unit_name : "").toLowerCase();
        if (!pCode.includes(searchKeyword) && !pName.includes(searchKeyword) && !uName.includes(searchKeyword)) {
          return false;
        }
      }

      const hasResult = !!councilMap[p.process_id];
      if (currentFilter === "upcoming") {
        return !hasResult;
      }
      if (currentFilter === "pending") {
        return !hasResult;
      }
      if (currentFilter === "done" || currentFilter === "completed") {
        return hasResult;
      }
      if (currentFilter === "cancelled") {
        const st = (p.status || "").toLowerCase();
        return st.includes("hủy") || st.includes("huy");
      }
      return true;
    });

    // Gom nhóm theo planned_council_date
    const groups = {};
    filtered.forEach(p => {
      const d = p.planned_council_date;
      if (!d) return;
      if (!groups[d]) {
        groups[d] = [];
      }
      groups[d].push(p);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    container.innerHTML = "";

    if (sortedDates.length === 0) {
      let emptyMsg = "Không có phiên họp nào theo kế hoạch";
      if (currentFilter === "cancelled") emptyMsg = "Không có lịch họp nào bị hủy";
      else if (currentFilter === "upcoming") emptyMsg = "Không có cuộc họp nào sắp diễn ra";
      else if (currentFilter === "pending") emptyMsg = "Không có lịch họp nào đang chờ duyệt";
      else if (currentFilter === "done" || currentFilter === "completed") emptyMsg = "Chưa có cuộc họp nào đã hoàn thành";
      else if (searchKeyword) emptyMsg = \`Không tìm thấy phiên họp nào cho "\${searchKeyword}"\`;
      container.appendChild(createEmptyEl(emptyMsg));
      return;
    }

    sortedDates.forEach(d => {
      const dayCard = createDaySessionCard(d, groups[d], councilMap);
      container.appendChild(dayCard);
    });
  }

  // Gắn hàm toàn cục cho tab và tìm kiếm
  window.filterMeetings = function(type, buttonEl) {
    currentFilter = type;
    const tabs = document.querySelectorAll(".filter-tab");
    tabs.forEach(tab => {
      tab.classList.remove("bg-primary", "text-on-primary", "shadow-sm");
      tab.classList.add("bg-surface-container", "text-on-surface-variant");
    });
    if (buttonEl) {
      buttonEl.classList.remove("bg-surface-container", "text-on-surface-variant");
      buttonEl.classList.add("bg-primary", "text-on-primary", "shadow-sm");
    }
    renderMeetingCards();
  };

  window.handleSearch = function(query) {
    searchKeyword = (query || "").trim().toLowerCase();
    renderMeetingCards();
  };

  // Khởi tạo lịch họp
  async function initSchedule() {
    await waitForAuth();

    const container = document.getElementById("meetings-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(createLoadingEl("Đang tải dữ liệu lịch họp Hội đồng..."));
    }

    try {
      const [procRes, councilRes] = await Promise.all([
        sb.from("processes")
          .select("process_id, document_name, status, planned_council_date, units(unit_name)")
          .not("planned_council_date", "is", null)
          .order("planned_council_date"),
        sb.from("council_results")
          .select("process_id, meeting_date, result, general_comment, revision_required, revision_deadline")
          .order("meeting_date", { ascending: false })
      ]);

      if (procRes.error || councilRes.error) {
        console.error("Lỗi khi tải lịch họp từ Supabase:", procRes.error || councilRes.error);
        if (container) {
          container.innerHTML = "";
          container.appendChild(createErrorEl("Không thể tải dữ liệu lịch họp. Vui lòng thử lại sau."));
        }
        return;
      }

      allProcesses = procRes.data || [];
      const councilList = councilRes.data || [];

      councilMap = {};
      councilList.forEach(cr => {
        if (!councilMap[cr.process_id]) {
          councilMap[cr.process_id] = cr;
        }
      });

      updateStatsAndCounts();
      renderMeetingCards();

      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          searchKeyword = (e.target.value || "").trim().toLowerCase();
          renderMeetingCards();
        });
      }
    } catch (err) {
      console.error("Lỗi ngoại lệ khi khởi tạo trang lịch họp:", err);
      if (container) {
        container.innerHTML = "";
        container.appendChild(createErrorEl("Lỗi kết nối cơ sở dữ liệu khi tải lịch họp."));
      }
    }
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSchedule);
  } else {
    initSchedule();
  }
})();
</script>`;

if (!html.includes(targetAuth)) throw new Error('targetAuth not found');
html = html.replace(targetAuth, scheduleScript);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated', filePath, 'new length:', html.length);
