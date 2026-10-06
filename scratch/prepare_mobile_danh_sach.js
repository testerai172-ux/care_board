const fs = require('fs');

const orig = fs.readFileSync('frontend_mobile/mobile_danh_s_ch_h_s_ti_n/danh-sach-ho-so.html', 'utf8');

let html = orig;

// 1. Search input
html = html.replace(
  '<input class="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Tìm mã hồ sơ, tên tài liệu, tác giả..." type="text"/>',
  '<input id="search-input" class="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Tìm mã hồ sơ, tên tài liệu, tác giả..." type="text"/>'
);

// 2. List container
html = html.replace(
  '<!-- Danh sách Hồ sơ (Card Workflow di động) -->\n<div class="px-space-md py-space-xs flex flex-col gap-3.5">',
  '<!-- Danh sách Hồ sơ (Card Workflow di động) -->\n<div class="px-space-md py-space-xs flex flex-col gap-3.5" id="mobile-processes-container">'
);

// Add script after auth.js
const authScriptTag = '<script src="../auth.js"></script>';
const dataScript = `
<script id="mobile-danh-sach-script">
(function() {
  let allProcesses = [];
  let currentFilter = "all";
  let searchKeyword = "";

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

  function renderList(container, template, items) {
    container.textContent = "";

    if (items.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "p-8 text-center text-sm text-slate-500 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60";
      emptyDiv.textContent = "Không tìm thấy hồ sơ nào phù hợp.";
      container.appendChild(emptyDiv);
      return;
    }

    items.forEach(item => {
      const card = template.cloneNode(true);

      const codeSpan = card.querySelector(".text-primary-container.font-bold");
      if (codeSpan) codeSpan.textContent = item.document_code || item.process_id || "N/A";

      const statusBadge = card.querySelector(".font-workflow-step");
      if (statusBadge) statusBadge.textContent = item.status || "Đang xử lý";

      const titleH3 = card.querySelector("h3");
      if (titleH3) titleH3.textContent = item.document_name || "Chưa đặt tên";

      const metaSpans = card.querySelectorAll(".font-body-sm.text-on-surface-variant");
      if (metaSpans.length > 0) {
        const u = item.units && item.units.unit_name ? item.units.unit_name : "Toàn viện";
        const author = item.profiles && item.profiles.display_name ? item.profiles.display_name : "Chưa phân công";
        metaSpans[0].textContent = \`\${author} • \${u}\`;
      }

      // Action buttons
      const detailBtn = card.querySelector("button");
      if (detailBtn) {
        detailBtn.onclick = (e) => {
          e.stopPropagation();
          window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(item.process_id);
        };
      }

      card.style.cursor = "pointer";
      card.onclick = () => {
        window.location.href = "khong-gian-tai-lieu.html?id=" + encodeURIComponent(item.process_id);
      };

      container.appendChild(card);
    });
  }

  function applyFilter(container, template) {
    let filtered = allProcesses;

    if (currentFilter !== "all") {
      filtered = filtered.filter(p => {
        const st = (p.status || "").toLowerCase();
        const stage = Number(p.stage);
        if (currentFilter === "draft") return stage === 1 || st.includes("soạn thảo");
        if (currentFilter === "intake") return stage === 2 || st.includes("tiếp nhận");
        if (currentFilter === "review") return stage === 3 || st.includes("soát xét") || st.includes("thẩm định");
        if (currentFilter === "council") return stage === 4 || st.includes("hội đồng");
        return true;
      });
    }

    if (searchKeyword.trim() !== "") {
      const q = searchKeyword.toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.document_name || "").toLowerCase();
        const code = (p.document_code || p.process_id || "").toLowerCase();
        const unit = (p.units && p.units.unit_name ? p.units.unit_name : "").toLowerCase();
        return name.includes(q) || code.includes(q) || unit.includes(q);
      });
    }

    renderList(container, template, filtered);
  }

  async function init() {
    try {
      await guardPage();

      const container = document.getElementById("mobile-processes-container");
      if (!container || !container.firstElementChild) return;

      const template = container.firstElementChild.cloneNode(true);

      const { data, error } = await sb
        .from("processes")
        .select("process_id, document_name, document_type, document_code, status, priority, stage, planned_council_date, review_deadline, units(unit_name), profiles(display_name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi tải danh sách hồ sơ:", error);
        container.textContent = "";
        const errDiv = document.createElement("div");
        errDiv.className = "p-6 text-center text-red-600 bg-red-50 rounded-2xl border border-red-200 text-sm";
        errDiv.textContent = "Không thể tải danh sách hồ sơ từ hệ thống. Vui lòng tải lại trang.";
        container.appendChild(errDiv);
        return;
      }

      allProcesses = data || [];

      // Update tab counts
      document.querySelectorAll(".tab-btn").forEach(btn => {
        const tab = btn.getAttribute("data-tab");
        const countSpan = btn.querySelector("span");
        if (countSpan && tab) {
          if (tab === "all") countSpan.textContent = \`(\${allProcesses.length})\`;
          else if (tab === "draft") countSpan.textContent = \`(\${allProcesses.filter(p => p.stage === 1 || (p.status||'').includes('soạn thảo')).length})\`;
          else if (tab === "intake") countSpan.textContent = \`(\${allProcesses.filter(p => p.stage === 2 || (p.status||'').includes('tiếp nhận')).length})\`;
          else if (tab === "review") countSpan.textContent = \`(\${allProcesses.filter(p => p.stage === 3 || (p.status||'').includes('thẩm định')).length})\`;
          else if (tab === "council") countSpan.textContent = \`(\${allProcesses.filter(p => p.stage === 4 || (p.status||'').includes('hội đồng')).length})\`;
        }

        btn.addEventListener("click", function() {
          document.querySelectorAll(".tab-btn").forEach(b => {
            b.className = "tab-btn px-3 py-1.5 rounded-full font-label-md text-label-md font-medium bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors";
          });
          this.className = "tab-btn px-3 py-1.5 rounded-full font-label-md text-label-md font-bold bg-primary-container text-on-primary shadow-sm";
          currentFilter = tab;
          applyFilter(container, template);
        });
      });

      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", function(e) {
          searchKeyword = e.target.value;
          applyFilter(container, template);
        });
      }

      applyFilter(container, template);

    } catch (err) {
      console.error("Lỗi khởi tạo mobile danh sách hồ sơ:", err);
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

fs.writeFileSync('frontend_mobile/danh-sach-ho-so.html', html, 'utf8');
console.log('Successfully written frontend_mobile/danh-sach-ho-so.html');

// Validate:
const checkBeforeAuth = html.slice(0, html.indexOf('../auth.js'));
const checkOrigBeforeAuth = orig.slice(0, orig.indexOf('../auth.js'));

const origTags = (checkOrigBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);
const curTags = (checkBeforeAuth.match(/<[a-zA-Z0-9\-]+/g) || []);

console.log('Mobile danh-sach orig tags:', origTags.length);
console.log('Mobile danh-sach cur tags:', curTags.length);
console.log('Mobile danh-sach diff:', curTags.length - origTags.length);
