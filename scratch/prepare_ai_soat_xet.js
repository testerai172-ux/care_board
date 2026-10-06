const fs = require('fs');

// ==========================================
// DESKTOP AI-SOAT-XET
// ==========================================
function prepareDesktopAISoatXet() {
  const orig = fs.readFileSync('frontend_desktop/desktop_ai_so_t_x_t_chuy_n_m_n_t_ng/ai-soat-xet.html', 'utf8');
  let html = orig;

  // Header code
  html = html.replace(
    '<span class="font-headline-sm text-headline-sm text-primary font-bold">QTKT-DD-2026-084</span>',
    '<span id="ai-process-id" class="font-headline-sm text-headline-sm text-primary font-bold">QTKT-DD-2026-084</span>'
  );

  // Reviewer span
  html = html.replace(
    '<span class="">Phản biện: ThS.ĐD. Trần Minh Thư</span>',
    '<span id="ai-reviewer" class="">Phản biện: ThS.ĐD. Trần Minh Thư</span>'
  );

  // Document title header
  html = html.replace(
    '<h2 class="font-bold text-primary text-base mt-1">QUY TRÌNH KỸ THUẬT: ĐẶT VÀ CHĂM SÓC CATHETER TĨNH MẠCH NGOẠI BIÊN</h2>',
    '<h2 id="ai-doc-name" class="font-bold text-primary text-base mt-1">QUY TRÌNH KỸ THUẬT: ĐẶT VÀ CHĂM SÓC CATHETER TĨNH MẠCH NGOẠI BIÊN</h2>'
  );

  // Issues count header
  html = html.replace(
    '<span class="font-headline-sm text-sm text-primary font-bold">Vấn đề phát hiện (3)</span>',
    '<span id="ai-issues-count" class="font-headline-sm text-sm text-primary font-bold">Vấn đề phát hiện (3)</span>'
  );

  // Summary quote text in header
  html = html.replace(
    '<p class="font-body-sm text-body-sm text-on-surface-variant"><span class="font-semibold text-on-surface">Nguyên tắc kiểm soát chất lượng:</span> AI chỉ đưa ra khuyến nghị phân tích khách quan từ kho dữ liệu Chuẩn Bộ Y tế và CDC 2024. Kết luận và thẩm duyệt văn bản cuối cùng hoàn toàn thuộc về thẩm quyền của Thư ký &amp; Hội đồng chuyên môn Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh.</p>',
    '<p id="ai-summary-text" class="font-body-sm text-body-sm text-on-surface-variant"><span class="font-semibold text-on-surface">Nguyên tắc kiểm soát chất lượng:</span> AI chỉ đưa ra khuyến nghị phân tích khách quan từ kho dữ liệu Chuẩn Bộ Y tế và CDC 2024. Kết luận và thẩm duyệt văn bản cuối cùng hoàn toàn thuộc về thẩm quyền của Thư ký &amp; Hội đồng chuyên môn Bệnh viện Đại học Y Dược Thành phố Hồ Chí Minh.</p>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="ai-review-data-script">
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
      const procId = urlParams.get("id");

      let review = null;
      if (procId) {
        const { data, error } = await sb
          .from("ai_reviews")
          .select("*, processes(document_name, document_code, status)")
          .eq("process_id", procId)
          .maybeSingle();
        if (!error && data) review = data;
      }

      if (!review) {
        const { data, error } = await sb
          .from("ai_reviews")
          .select("*, processes(document_name, document_code, status)")
          .order("reviewed_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!error && data) review = data;
      }

      if (!review) {
        console.warn("Chưa có bản ghi soát xét AI nào.");
        return;
      }

      // Update header info
      const idEl = document.getElementById("ai-process-id");
      if (idEl) idEl.textContent = review.process_id || "N/A";

      const nameEl = document.getElementById("ai-doc-name");
      if (nameEl) nameEl.textContent = review.processes && review.processes.document_name ? review.processes.document_name.toUpperCase() : "QUY TRÌNH CHUYÊN MÔN";

      const countEl = document.getElementById("ai-issues-count");
      if (countEl) countEl.textContent = \`Vấn đề phát hiện (\${review.issue_count || 0})\`;

      const summaryEl = document.getElementById("ai-summary-text");
      if (summaryEl && review.summary) {
        summaryEl.textContent = review.summary;
      }

      // Populate issues list using template
      const issuesContainer = document.getElementById("issues-container");
      if (issuesContainer && issuesContainer.firstElementChild) {
        const template = issuesContainer.firstElementChild.cloneNode(true);
        issuesContainer.textContent = "";

        const issuesList = [];
        if (review.completeness_result) {
          issuesList.push({
            type: "Đầy đủ & Thể thức",
            badge: "Thể thức",
            content: review.completeness_result,
            isCritical: false
          });
        }
        if (review.consistency_result) {
          issuesList.push({
            type: "Tính nhất quán nội dung",
            badge: "Nhất quán",
            content: review.consistency_result,
            isCritical: true
          });
        }
        if (review.reference_check_result) {
          issuesList.push({
            type: "Căn cứ pháp lý & Tài liệu viện dẫn",
            badge: "Viện dẫn",
            content: review.reference_check_result,
            isCritical: false
          });
        }
        if (review.version_compare_result) {
          issuesList.push({
            type: "So khớp phiên bản trước",
            badge: "Phiên bản",
            content: review.version_compare_result,
            isCritical: false
          });
        }

        if (issuesList.length === 0) {
          const empty = document.createElement("div");
          empty.className = "p-4 text-center text-xs text-slate-500 bg-surface-container-lowest rounded-xl";
          empty.textContent = "AI không phát hiện điểm bất thường nào trong tài liệu.";
          issuesContainer.appendChild(empty);
        } else {
          issuesList.forEach((iss, idx) => {
            const card = template.cloneNode(true);
            const titleSpan = card.querySelector(".text-slate-700");
            if (titleSpan) titleSpan.textContent = \`Vấn đề 0\${idx + 1} • \${iss.type}\`;

            const badgeSpan = card.querySelector(".uppercase");
            if (badgeSpan) badgeSpan.textContent = iss.badge;

            const pText = card.querySelector("p");
            if (pText) pText.textContent = iss.content;

            issuesContainer.appendChild(card);
          });
        }
      }

    } catch (err) {
      console.error("Lỗi AI Soát xét:", err);
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
  fs.writeFileSync('frontend_desktop/ai-soat-xet.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/ai-soat-xet.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop ai-soat-xet orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE AI-SOAT-XET
// ==========================================
function prepareMobileAISoatXet() {
  const orig = fs.readFileSync('frontend_mobile/mobile_ai_so_t_x_t_chuy_n_m_n_t_ng/ai-soat-xet.html', 'utf8');
  let html = orig;

  // Header code
  html = html.replace(
    '<span class="font-mono text-label-md text-primary font-bold">QTKT-DD-2026-084</span>',
    '<span id="mobile-ai-process-id" class="font-mono text-label-md text-primary font-bold">QTKT-DD-2026-084</span>'
  );

  // Document name
  html = html.replace(
    '<h1 class="text-[18px] leading-snug text-primary font-bold tracking-tight mb-2"> Quy trình kỹ thuật đặt, chăm sóc và theo dõi catheter tĩnh mạch ngoại biên </h1>',
    '<h1 id="mobile-ai-doc-name" class="text-[18px] leading-snug text-primary font-bold tracking-tight mb-2"> Quy trình kỹ thuật đặt, chăm sóc và theo dõi catheter tĩnh mạch ngoại biên </h1>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-ai-data-script">
(function() {
  async function init() {
    try {
      await guardPage();
      const urlParams = new URLSearchParams(window.location.search);
      const procId = urlParams.get("id");

      let review = null;
      if (procId) {
        const { data } = await sb.from("ai_reviews").select("*, processes(*)").eq("process_id", procId).maybeSingle();
        if (data) review = data;
      }
      if (!review) {
        const { data } = await sb.from("ai_reviews").select("*, processes(*)").order("reviewed_at", { ascending: false }).limit(1).maybeSingle();
        if (data) review = data;
      }
      if (!review) return;

      const idEl = document.getElementById("mobile-ai-process-id");
      if (idEl) idEl.textContent = review.process_id || "N/A";

      const nameEl = document.getElementById("mobile-ai-doc-name");
      if (nameEl) nameEl.textContent = review.processes && review.processes.document_name ? review.processes.document_name : "Quy trình chuyên môn";

    } catch (err) {
      console.error("Lỗi mobile ai-soat-xet:", err);
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
  fs.writeFileSync('frontend_mobile/ai-soat-xet.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/ai-soat-xet.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile ai-soat-xet orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopAISoatXet();
prepareMobileAISoatXet();
