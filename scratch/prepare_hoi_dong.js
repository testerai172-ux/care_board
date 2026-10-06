const fs = require('fs');

// ==========================================
// DESKTOP HOI-DONG
// ==========================================
function prepareDesktopHoiDong() {
  const orig = fs.readFileSync('frontend_desktop/desktop_h_i_ng_ban_h_nh_v_n_b_n/hoi-dong-ban-hanh.html', 'utf8');
  let html = orig;

  // Code badge
  html = html.replace(
    '<span class="text-xs text-slate-400 font-medium">Mã lưu trữ: QTKT-2026-001</span>',
    '<span id="council-code-badge" class="text-xs text-slate-400 font-medium">Mã lưu trữ: QTKT-2026-001</span>'
  );

  // Title
  html = html.replace(
    '<h1 class="text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight">Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên</h1>',
    '<h1 id="council-doc-title" class="text-xl lg:text-[22px] font-bold text-slate-900 tracking-tight">Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên</h1>'
  );

  // Fix missing brace in orig tailwind config if needed
  html = html.replace(
    'fontWeight:"600"}]}}}</script>',
    'fontWeight:"600"}]}}}}</script>'
  );

  // Decision No
  html = html.replace(
    '<span class="text-sm font-bold text-[#083B76]">QĐ 142/QĐ-BVDHYD</span>',
    '<span id="council-decision-no" class="text-sm font-bold text-[#083B76]">QĐ 142/QĐ-BVDHYD</span>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="council-decision-data-script">
(function() {
  async function init() {
    try {
      await guardPage();

      const urlParams = new URLSearchParams(window.location.search);
      const procId = urlParams.get("id");

      let currentResult = null;
      if (procId) {
        const { data } = await sb
          .from("council_results")
          .select("*, processes(*)")
          .eq("process_id", procId)
          .maybeSingle();
        if (data) currentResult = data;
      }

      if (!currentResult) {
        const { data } = await sb
          .from("council_results")
          .select("*, processes(*)")
          .order("meeting_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) currentResult = data;
      }

      if (currentResult) {
        const codeEl = document.getElementById("council-code-badge");
        if (codeEl) codeEl.textContent = "Mã lưu trữ: " + (currentResult.process_id || "N/A");

        const titleEl = document.getElementById("council-doc-title");
        if (titleEl && currentResult.processes && currentResult.processes.document_name) {
          titleEl.textContent = currentResult.processes.document_name;
        }

        const decEl = document.getElementById("council-decision-no");
        if (decEl) {
          decEl.textContent = currentResult.result ? ("Kết quả: " + currentResult.result) : "QĐ 142/QĐ-BVDHYD";
        }
      }

    } catch (err) {
      console.error("Lỗi Hội đồng ban hành:", err);
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
  fs.writeFileSync('frontend_desktop/hoi-dong-ban-hanh.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/hoi-dong-ban-hanh.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop hoi-dong orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE HOI-DONG
// ==========================================
function prepareMobileHoiDong() {
  const orig = fs.readFileSync('frontend_mobile/mobile_h_i_ng_ban_h_nh_v_n_b_n/hoi-dong-ban-hanh.html', 'utf8');
  let html = orig;

  // Title
  html = html.replace(
    '<h1 class="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold mt-2 leading-tight"> Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên </h1>',
    '<h1 id="mobile-council-doc-title" class="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold mt-2 leading-tight"> Quy trình thiết lập và quản lý catheter tĩnh mạch ngoại biên </h1>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-council-data-script">
(function() {
  async function init() {
    try {
      await guardPage();
      const urlParams = new URLSearchParams(window.location.search);
      const procId = urlParams.get("id");

      let currentResult = null;
      if (procId) {
        const { data } = await sb.from("council_results").select("*, processes(*)").eq("process_id", procId).maybeSingle();
        if (data) currentResult = data;
      }
      if (!currentResult) {
        const { data } = await sb.from("council_results").select("*, processes(*)").order("meeting_date", { ascending: false }).limit(1).maybeSingle();
        if (data) currentResult = data;
      }
      if (currentResult && currentResult.processes && currentResult.processes.document_name) {
        const titleEl = document.getElementById("mobile-council-doc-title");
        if (titleEl) titleEl.textContent = currentResult.processes.document_name;
      }
    } catch (err) {
      console.error("Lỗi mobile hội đồng:", err);
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
  fs.writeFileSync('frontend_mobile/hoi-dong-ban-hanh.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/hoi-dong-ban-hanh.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile hoi-dong orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopHoiDong();
prepareMobileHoiDong();
