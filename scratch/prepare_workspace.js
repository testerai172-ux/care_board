const fs = require('fs');

// ==========================================
// DESKTOP WORKSPACE
// ==========================================
function prepareDesktopWorkspace() {
  const orig = fs.readFileSync('frontend_desktop/desktop_document_workspace_qtkt_2026_001/khong-gian-tai-lieu.html', 'utf8');
  let html = orig;

  // Header code badge
  html = html.replace(
    '<span class="font-mono text-label-md font-bold text-primary-container">QTKT-2026-001</span>',
    '<span id="workspace-process-id" class="font-mono text-label-md font-bold text-primary-container">QTKT-2026-001</span>'
  );

  // Status badge
  html = html.replace(
    '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">Thư ký sơ thẩm (GĐ 3)</span>',
    '<span id="workspace-status" class="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">Thư ký sơ thẩm (GĐ 3)</span>'
  );

  // Title
  html = html.replace(
    '<h1 class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Quy trình thiết lập catheter tĩnh mạch ngoại biên</h1>',
    '<h1 id="workspace-doc-name" class="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Quy trình thiết lập catheter tĩnh mạch ngoại biên</h1>'
  );

  // Metadata subtitle
  html = html.replace(
    '<span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Khoa Hồi sức tích cực - Chống độc • Cập nhật: 12/03/2026 • Tác giả: ĐD. Nguyễn Văn An</span>',
    '<span id="workspace-metadata" class="font-label-sm text-label-sm text-on-surface-variant font-medium">Khoa Hồi sức tích cực - Chống độc • Cập nhật: 12/03/2026 • Tác giả: ĐD. Nguyễn Văn An</span>'
  );

  // AI Review action button
  html = html.replace(
    '<button class="px-space-md py-space-xs rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center gap-space-xs border border-outline-variant/30">',
    '<button id="btn-goto-ai-review" class="px-space-md py-space-xs rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center gap-space-xs border border-outline-variant/30">'
  );

  // Council action button
  html = html.replace(
    '<button class="px-space-md py-space-xs rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center gap-space-xs border border-outline-variant/30">\n<span class="material-symbols-outlined text-space-md">gavel</span>\n<span class="">Hội đồng thẩm duyệt</span>\n</button>',
    '<button id="btn-goto-council" class="px-space-md py-space-xs rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center gap-space-xs border border-outline-variant/30">\n<span class="material-symbols-outlined text-space-md">gavel</span>\n<span class="">Hội đồng thẩm duyệt</span>\n</button>'
  );

  // Files bucket title
  html = html.replace(
    '<p class="font-label-sm text-label-sm text-on-surface-variant">Bucket: document-files / QTKT-2026-001</p>',
    '<p id="workspace-bucket-desc" class="font-label-sm text-label-sm text-on-surface-variant">Bucket: document-files / QTKT-2026-001</p>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="document-workspace-data-script">
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

  async function initWorkspace() {
    try {
      await guardPage();

      const urlParams = new URLSearchParams(window.location.search);
      let procId = urlParams.get("id");

      let currentProc = null;
      if (procId) {
        const { data, error } = await sb
          .from("processes")
          .select("*, units(unit_name), profiles(display_name)")
          .eq("process_id", procId)
          .maybeSingle();
        if (!error && data) currentProc = data;
      }

      if (!currentProc) {
        const { data, error } = await sb
          .from("processes")
          .select("*, units(unit_name), profiles(display_name)")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) currentProc = data;
      }

      if (!currentProc) {
        console.warn("Không tìm thấy hồ sơ.");
        return;
      }

      // Update header
      const idEl = document.getElementById("workspace-process-id");
      if (idEl) idEl.textContent = currentProc.process_id || "N/A";

      const statusEl = document.getElementById("workspace-status");
      if (statusEl) statusEl.textContent = currentProc.status || ("Giai đoạn " + (currentProc.stage || 1));

      const titleEl = document.getElementById("workspace-doc-name");
      if (titleEl) titleEl.textContent = currentProc.document_name || "Chưa đặt tên";

      const metaEl = document.getElementById("workspace-metadata");
      if (metaEl) {
        const u = currentProc.units && currentProc.units.unit_name ? currentProc.units.unit_name : "Toàn viện";
        const author = currentProc.profiles && currentProc.profiles.display_name ? currentProc.profiles.display_name : "Chưa phân công";
        const d = formatDate(currentProc.updated_at || currentProc.created_at);
        metaEl.textContent = \`\${u} • Cập nhật: \${d} • Tác giả: \${author}\`;
      }

      const bucketEl = document.getElementById("workspace-bucket-desc");
      if (bucketEl) {
        bucketEl.textContent = "Bucket: document-files / " + currentProc.process_id;
      }

      // Action buttons
      const btnAI = document.getElementById("btn-goto-ai-review");
      if (btnAI) {
        btnAI.onclick = () => {
          window.location.href = "ai-soat-xet.html?id=" + encodeURIComponent(currentProc.process_id);
        };
      }

      const btnCouncil = document.getElementById("btn-goto-council");
      if (btnCouncil) {
        btnCouncil.onclick = () => {
          window.location.href = "hoi-dong-ban-hanh.html?id=" + encodeURIComponent(currentProc.process_id);
        };
      }

    } catch (err) {
      console.error("Lỗi khởi tạo không gian tài liệu:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWorkspace);
  } else {
    initWorkspace();
  }
})();
</script>
`;

  html = html.replace(authScriptTag, authScriptTag + dataScript);
  fs.writeFileSync('frontend_desktop/khong-gian-tai-lieu.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/khong-gian-tai-lieu.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop workspace orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE WORKSPACE
// ==========================================
function prepareMobileWorkspace() {
  const orig = fs.readFileSync('frontend_mobile/mobile_kho_t_i_li_u_workspace/khong-gian-tai-lieu.html', 'utf8');
  let html = orig;

  // Header code badge
  html = html.replace(
    '<span class="font-mono text-label-md text-primary font-bold">QTKT-2026-001</span>',
    '<span id="mobile-workspace-process-id" class="font-mono text-label-md text-primary font-bold">QTKT-2026-001</span>'
  );

  // Title
  html = html.replace(
    '<h1 class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight"> Quy trình thiết lập catheter tĩnh mạch ngoại biên </h1>',
    '<h1 id="mobile-workspace-doc-name" class="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold tracking-tight"> Quy trình thiết lập catheter tĩnh mạch ngoại biên </h1>'
  );

  // Status
  html = html.replace(
    '<span class="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"> Thư ký sơ thẩm (GĐ 3) </span>',
    '<span id="mobile-workspace-status" class="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold"> Thư ký sơ thẩm (GĐ 3) </span>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-workspace-data-script">
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

      const urlParams = new URLSearchParams(window.location.search);
      let procId = urlParams.get("id");

      let currentProc = null;
      if (procId) {
        const { data } = await sb
          .from("processes")
          .select("*, units(unit_name), profiles(display_name)")
          .eq("process_id", procId)
          .maybeSingle();
        if (data) currentProc = data;
      }

      if (!currentProc) {
        const { data } = await sb
          .from("processes")
          .select("*, units(unit_name), profiles(display_name)")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) currentProc = data;
      }

      if (!currentProc) return;

      const idEl = document.getElementById("mobile-workspace-process-id");
      if (idEl) idEl.textContent = currentProc.process_id || "N/A";

      const nameEl = document.getElementById("mobile-workspace-doc-name");
      if (nameEl) nameEl.textContent = currentProc.document_name || "Chưa đặt tên";

      const stEl = document.getElementById("mobile-workspace-status");
      if (stEl) stEl.textContent = currentProc.status || ("Giai đoạn " + (currentProc.stage || 1));

    } catch (err) {
      console.error("Lỗi mobile workspace:", err);
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
  fs.writeFileSync('frontend_mobile/khong-gian-tai-lieu.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/khong-gian-tai-lieu.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile workspace orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopWorkspace();
prepareMobileWorkspace();
