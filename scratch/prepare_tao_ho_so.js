const fs = require('fs');

// ==========================================
// DESKTOP TAO-HO-SO
// ==========================================
function prepareDesktopTaoHoSo() {
  const orig = fs.readFileSync('frontend_desktop/desktop_t_o_h_s_n_p_t_i_li_u_m_i/tao-ho-so.html', 'utf8');
  let html = orig;

  // Add IDs to existing inputs without changing any tags or classes
  html = html.replace(
    '<input class="w-full px-3 py-2 text-xs font-mono font-bold text-[#083B76] bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" readonly="" type="text" value="QTKT-2026-089"/>',
    '<input id="input-process-id" class="w-full px-3 py-2 text-xs font-mono font-bold text-[#083B76] bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" readonly="" type="text" value="QTKT-2026-089"/>'
  );

  html = html.replace(
    'placeholder="VD: Quy trình kỹ thuật kiểm soát hạ thân nhiệt chu phẫu" type="text" value="Quy trình kỹ thuật đặt và chăm sóc đường truyền tĩnh mạch trung tâm qua ngoại biên (PICC)"/>',
    'placeholder="VD: Quy trình kỹ thuật kiểm soát hạ thân nhiệt chu phẫu" type="text" value="Quy trình kỹ thuật đặt và chăm sóc đường truyền tĩnh mạch trung tâm qua ngoại biên (PICC)" id="input-document-name"/>'
  );

  // Planned council date
  html = html.replace(
    '<input class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" type="date" value="2026-03-26"/>',
    '<input id="input-planned-council-date" class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" type="date" value="2026-03-26"/>'
  );

  // Document type select
  const docTypeIdx = html.indexOf('<select class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg');
  if (docTypeIdx > -1) {
    html = html.slice(0, docTypeIdx) + '<select id="select-document-type" class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg' + html.slice(docTypeIdx + '<select class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg'.length);
  }

  // Unit select (second select)
  const unitIdx = html.indexOf('<select class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg', docTypeIdx + 50);
  if (unitIdx > -1) {
    html = html.slice(0, unitIdx) + '<select id="select-unit-id" class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg' + html.slice(unitIdx + '<select class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg'.length);
  }

  // Review deadline
  html = html.replace(
    '<input class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" type="date" value="2026-03-12"/>',
    '<input id="input-review-deadline" class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none" type="date" value="2026-03-12"/>'
  );

  // Description textarea
  html = html.replace(
    '<textarea class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none placeholder:text-slate-400',
    '<textarea id="textarea-description" class="w-full px-3 py-2 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#083B76] outline-none placeholder:text-slate-400'
  );

  // Submit button
  html = html.replace(
    '<button class="px-5 py-2 text-xs font-bold text-white bg-[#083B76] hover:bg-[#002551] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5" onclick="handleSubmit()" type="button">',
    '<button id="btn-submit" class="px-5 py-2 text-xs font-bold text-white bg-[#083B76] hover:bg-[#002551] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5" onclick="handleSubmit()" type="button">'
  );

  // Append script after auth.js
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="tao-ho-so-data-script">
(function() {
  let currentUser = null;

  async function loadUnits() {
    try {
      const { data, error } = await sb.from("units").select("id, unit_name").order("unit_name");
      if (error) {
        console.error("Lỗi nạp danh mục đơn vị:", error);
        return;
      }
      const selectUnit = document.getElementById("select-unit-id");
      if (selectUnit && data) {
        selectUnit.textContent = "";
        data.forEach(u => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.textContent = u.unit_name;
          selectUnit.appendChild(opt);
        });
        if (currentUser && currentUser.unit_id) {
          selectUnit.value = currentUser.unit_id;
        }
      }
    } catch (err) {
      console.error("Lỗi kết nối units:", err);
    }
  }

  window.handleSubmit = async function() {
    const btn = document.getElementById("btn-submit");
    const nameInput = document.getElementById("input-document-name");
    const docName = nameInput ? nameInput.value.trim() : "";
    if (!docName) {
      alert("Vui lòng nhập tên tài liệu quy trình.");
      if (nameInput) nameInput.focus();
      return;
    }

    const typeSelect = document.getElementById("select-document-type");
    const unitSelect = document.getElementById("select-unit-id");
    const councilInput = document.getElementById("input-planned-council-date");
    const deadlineInput = document.getElementById("input-review-deadline");
    const descInput = document.getElementById("textarea-description");
    const priEl = document.querySelector("input[name='priority']:checked");

    const payload = {
      process_id: "QTKT-2026-" + Math.floor(100 + Math.random() * 900),
      document_name: docName,
      document_type: typeSelect ? typeSelect.value : "Quy trình chuyên môn",
      unit_id: unitSelect ? unitSelect.value : null,
      planned_council_date: councilInput && councilInput.value ? councilInput.value : null,
      review_deadline: deadlineInput && deadlineInput.value ? deadlineInput.value : null,
      priority: priEl && priEl.parentElement && priEl.parentElement.textContent.includes("Cao") ? "Cao" : "Tiêu chuẩn",
      stage: 1,
      status: "Đang soạn thảo"
    };

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Đang khởi tạo...";
    }

    try {
      const { error } = await sb.from("processes").insert(payload);
      if (error) {
        console.error("Lỗi tạo hồ sơ:", error);
        alert("Lỗi tạo hồ sơ: " + error.message);
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Hoàn tất & Gửi hồ sơ";
        }
        return;
      }
      alert("Khởi tạo hồ sơ mới thành công!");
      window.location.href = "danh-sach-ho-so.html";
    } catch (err) {
      console.error("Lỗi handleSubmit:", err);
      alert("Đã xảy ra lỗi kết nối khi lưu hồ sơ.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Hoàn tất & Gửi hồ sơ";
      }
    }
  };

  async function init() {
    try {
      currentUser = await guardPage();
      await loadUnits();
    } catch (err) {
      console.error("Lỗi khởi tạo tạo hồ sơ:", err);
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
  fs.writeFileSync('frontend_desktop/tao-ho-so.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/tao-ho-so.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop tao-ho-so orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE TAO-HO-SO
// ==========================================
function prepareMobileTaoHoSo() {
  const orig = fs.readFileSync('frontend_mobile/mobile_t_o_h_s_n_p_t_i_li_u/tao-ho-so.html', 'utf8');
  let html = orig;

  // Add IDs
  html = html.replace(
    'placeholder="VD: QTKT-2026-084" readonly="" type="text" value="QTKT-2026-084"/>',
    'placeholder="VD: QTKT-2026-084" readonly="" type="text" value="QTKT-2026-084" id="mobile-input-process-id"/>'
  );

  html = html.replace(
    'placeholder="Nhập tên chính thức quy trình / hướng dẫn..." type="text" value="Quy trình Đặt và chăm sóc Catheter tĩnh mạch ngoại biên"/>',
    'placeholder="Nhập tên chính thức quy trình / hướng dẫn..." type="text" value="Quy trình Đặt và chăm sóc Catheter tĩnh mạch ngoại biên" id="mobile-input-document-name"/>'
  );

  // Submit button
  html = html.replace(
    '<button class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-transform">',
    '<button id="mobile-btn-submit" class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-transform">'
  );

  // Append script after auth.js
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-tao-ho-so-script">
(function() {
  let currentUser = null;

  async function loadUnits() {
    try {
      const { data, error } = await sb.from("units").select("id, unit_name").order("unit_name");
      if (error) {
        console.error("Lỗi nạp units mobile:", error);
        return;
      }
      const selects = document.querySelectorAll("select");
      if (selects.length >= 2 && data) {
        const unitSelect = selects[1];
        unitSelect.textContent = "";
        data.forEach(u => {
          const opt = document.createElement("option");
          opt.value = u.id;
          opt.textContent = u.unit_name;
          unitSelect.appendChild(opt);
        });
        if (currentUser && currentUser.unit_id) {
          unitSelect.value = currentUser.unit_id;
        }
      }
    } catch (err) {
      console.error("Lỗi kết nối units mobile:", err);
    }
  }

  async function init() {
    try {
      currentUser = await guardPage();
      await loadUnits();

      const btnSubmit = document.getElementById("mobile-btn-submit");
      if (btnSubmit) {
        btnSubmit.addEventListener("click", async function(e) {
          e.preventDefault();
          const nameInput = document.getElementById("mobile-input-document-name");
          const docName = nameInput ? nameInput.value.trim() : "";
          if (!docName) {
            alert("Vui lòng nhập tên quy trình / hướng dẫn.");
            if (nameInput) nameInput.focus();
            return;
          }

          const selects = document.querySelectorAll("select");
          const docType = selects[0] ? selects[0].value : "Quy trình kỹ thuật";
          const unitId = selects[1] ? selects[1].value : null;

          const payload = {
            process_id: "QTKT-2026-" + Math.floor(100 + Math.random() * 900),
            document_name: docName,
            document_type: docType,
            unit_id: unitId,
            stage: 1,
            status: "Đang soạn thảo"
          };

          btnSubmit.disabled = true;
          btnSubmit.textContent = "Đang gửi hồ sơ...";

          const { error } = await sb.from("processes").insert(payload);
          if (error) {
            console.error("Lỗi tạo hồ sơ mobile:", error);
            alert("Lỗi: " + error.message);
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Nộp hồ sơ";
            return;
          }

          alert("Khởi tạo hồ sơ thành công!");
          window.location.href = "danh-sach-ho-so.html";
        });
      }
    } catch (err) {
      console.error("Lỗi mobile tao-ho-so:", err);
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
  fs.writeFileSync('frontend_mobile/tao-ho-so.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/tao-ho-so.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile tao-ho-so orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopTaoHoSo();
prepareMobileTaoHoSo();
