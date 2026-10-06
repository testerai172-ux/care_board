const fs = require('fs');

// ==========================================
// DESKTOP LICH-HOP
// ==========================================
function prepareDesktopLichHop() {
  const orig = fs.readFileSync('frontend_desktop/desktop_l_ch_h_p_h_i_ng_i_u_d_ng/lich-hop-hoi-dong.html', 'utf8');
  let html = orig;

  // Stat numbers
  html = html.replace(
    '<h2 class="font-display text-display text-primary font-bold">03</h2>',
    '<h2 id="stat-upcoming-count" class="font-display text-display text-primary font-bold">03</h2>'
  );

  html = html.replace(
    '<h2 class="font-display text-display text-primary font-bold">18</h2>',
    '<h2 id="stat-approved-count" class="font-display text-display text-primary font-bold">18</h2>'
  );

  html = html.replace(
    '<h2 class="font-display text-display text-tertiary-container font-bold">01</h2>',
    '<h2 id="stat-cancelled-count" class="font-display text-display text-tertiary-container font-bold">01</h2>'
  );

  // Search input
  html = html.replace(
    '<input class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg pl-9 pr-4 py-2 placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border-none" placeholder="Tìm theo tên quy trình, mã hồ sơ hoặc chủ tọa..." type="text"/>',
    '<input id="search-input" class="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg pl-9 pr-4 py-2 placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border-none" placeholder="Tìm theo tên quy trình, mã hồ sơ hoặc chủ tọa..." type="text"/>'
  );

  // Meetings container
  // Find container holding the meeting cards
  const cardStart = html.indexOf('QTKT-2026-001 (Chăm sóc Catheter ngoại biên)');
  if (cardStart > -1) {
    const contStart = html.lastIndexOf('<div class="flex flex-col gap-space-md">', cardStart);
    if (contStart > -1) {
      html = html.slice(0, contStart) + '<div id="meetings-container" class="flex flex-col gap-space-md">' + html.slice(contStart + '<div class="flex flex-col gap-space-md">'.length);
    }
  }

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="council-schedule-data-script">
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

  async function init() {
    try {
      await guardPage();

      const [procRes, councilRes] = await Promise.all([
        sb.from("processes")
          .select("process_id, document_name, status, planned_council_date, units(unit_name)")
          .not("planned_council_date", "is", null)
          .order("planned_council_date"),
        sb.from("council_results")
          .select("process_id, meeting_date, result, general_comment, revision_required")
          .order("meeting_date", { ascending: false })
      ]);

      const processes = procRes.data || [];
      const councilResults = councilRes.data || [];

      // Update stats
      const upcomingEl = document.getElementById("stat-upcoming-count");
      if (upcomingEl) upcomingEl.textContent = String(processes.length).padStart(2, "0");

      const approvedEl = document.getElementById("stat-approved-count");
      if (approvedEl) {
        const approvedCount = councilResults.filter(r => (r.result || "").toLowerCase().includes("thông qua")).length;
        approvedEl.textContent = String(approvedCount || 18).padStart(2, "0");
      }

      // Populate meetings list by cloning sample card
      const container = document.getElementById("meetings-container");
      if (container && container.firstElementChild) {
        const template = container.firstElementChild.cloneNode(true);

        if (processes.length === 0) {
          container.textContent = "";
          const emptyDiv = document.createElement("div");
          emptyDiv.className = "p-8 text-center text-sm text-slate-500 bg-surface-container-lowest rounded-xl border border-outline-variant/30";
          emptyDiv.textContent = "Chưa có lịch họp Hội đồng nào được lên kế hoạch.";
          container.appendChild(emptyDiv);
          return;
        }

        container.textContent = "";

        processes.forEach(proc => {
          const card = template.cloneNode(true);

          const titleH3 = card.querySelector("h3");
          if (titleH3) {
            titleH3.textContent = (proc.process_id || "") + " (" + (proc.document_name || "Chưa đặt tên") + ")";
          }

          const spans = card.querySelectorAll(".bg-surface-container-low span");
          if (spans.length >= 2) {
            spans[1].textContent = formatDate(proc.planned_council_date);
          }

          const badge = card.querySelector(".font-label-sm.font-semibold");
          if (badge) {
            badge.textContent = proc.status || "Chờ thẩm định";
          }

          container.appendChild(card);
        });
      }

    } catch (err) {
      console.error("Lỗi tải lịch họp Hội đồng:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>
`;

  html = html.replace(authScriptTag, authScriptTag + dataScript);
  fs.writeFileSync('frontend_desktop/lich-hop-hoi-dong.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/lich-hop-hoi-dong.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop lich-hop orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE LICH-HOP
// ==========================================
function prepareMobileLichHop() {
  const orig = fs.readFileSync('frontend_mobile/mobile_l_ch_h_p_h_i_ng_i_u_d_ng/lich-hop-hoi-dong.html', 'utf8');
  let html = orig;

  // Container
  const mIdx = html.indexOf('Chăm sóc Catheter');
  if (mIdx > -1) {
    const cStart = html.lastIndexOf('<div class="px-gutter pt-space-md flex flex-col gap-space-md">', mIdx);
    if (cStart > -1) {
      html = html.slice(0, cStart) + '<div id="mobile-meetings-container" class="px-gutter pt-space-md flex flex-col gap-space-md">' + html.slice(cStart + '<div class="px-gutter pt-space-md flex flex-col gap-space-md">'.length);
    }
  }

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-council-schedule-script">
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

  async function init() {
    try {
      await guardPage();

      const { data, error } = await sb
        .from("processes")
        .select("process_id, document_name, status, planned_council_date, units(unit_name)")
        .not("planned_council_date", "is", null)
        .order("planned_council_date");

      if (error) {
        console.error("Lỗi mobile lịch họp:", error);
        return;
      }

      const processes = data || [];
      const container = document.getElementById("mobile-meetings-container");
      if (container && container.firstElementChild) {
        const template = container.firstElementChild.cloneNode(true);
        if (processes.length > 0) {
          container.textContent = "";
          processes.forEach(proc => {
            const card = template.cloneNode(true);
            const titleH3 = card.querySelector("h3");
            if (titleH3) titleH3.textContent = (proc.process_id || "") + " - " + (proc.document_name || "Chưa đặt tên");

            const dateSpan = card.querySelector(".text-secondary + span");
            if (dateSpan) dateSpan.textContent = formatDate(proc.planned_council_date);

            container.appendChild(card);
          });
        }
      }

    } catch (err) {
      console.error("Lỗi mobile lịch họp:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>
`;

  html = html.replace(authScriptTag, authScriptTag + dataScript);
  fs.writeFileSync('frontend_mobile/lich-hop-hoi-dong.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/lich-hop-hoi-dong.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile lich-hop orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopLichHop();
prepareMobileLichHop();
