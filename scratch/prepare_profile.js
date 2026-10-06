const fs = require('fs');

// ==========================================
// DESKTOP PROFILE
// ==========================================
function prepareDesktopProfile() {
  const orig = fs.readFileSync('frontend_desktop/desktop_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n/thong-tin-ca-nhan.html', 'utf8');
  let html = orig;

  // Header display name
  html = html.replace(
    '<h1 class="font-headline-lg text-headline-lg font-bold text-on-surface">ThS.ĐD Trần Minh Thư</h1>',
    '<h1 id="profile-display-name" class="font-headline-lg text-headline-lg font-bold text-on-surface">ThS.ĐD Trần Minh Thư</h1>'
  );

  // Role badge
  html = html.replace(
    '<span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Thư ký Hội đồng ĐD</span>',
    '<span id="profile-role-badge" class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Thư ký Hội đồng ĐD</span>'
  );

  // Unit
  html = html.replace(
    '<span class="truncate">Phòng Điều dưỡng</span>',
    '<span id="profile-unit" class="truncate">Phòng Điều dưỡng</span>'
  );

  // Email
  html = html.replace(
    '<span class="truncate">thu.tm@umc.edu.vn</span>',
    '<span id="profile-email" class="truncate">thu.tm@umc.edu.vn</span>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="profile-data-script">
(function() {
  async function init() {
    try {
      const me = await guardPage();
      if (!me) return;

      const { data: profile } = await sb
        .from("profiles")
        .select("id, display_name, email, role, phone, units(unit_name)")
        .eq("id", me.id)
        .maybeSingle();

      const user = profile || me;

      const nameEl = document.getElementById("profile-display-name");
      if (nameEl && user.display_name) nameEl.textContent = user.display_name;

      const roleEl = document.getElementById("profile-role-badge");
      if (roleEl) {
        roleEl.textContent = user.role === "secretary" ? "Thư ký Hội đồng ĐD" : "Tác giả Đơn vị";
      }

      const emailEl = document.getElementById("profile-email");
      if (emailEl && user.email) emailEl.textContent = user.email;

      const unitEl = document.getElementById("profile-unit");
      if (unitEl) {
        unitEl.textContent = (user.units && user.units.unit_name) ? user.units.unit_name : "Toàn viện";
      }

      // Password change form
      const btnSavePass = document.querySelector("button[onclick*='savePassword'], button[onclick*='changePassword'], #btn-save-password");
      // If user submits password change
      const newPassInput = document.querySelectorAll("input[type='password']")[1];
      const confirmPassInput = document.querySelectorAll("input[type='password']")[2];

    } catch (err) {
      console.error("Lỗi thông tin cá nhân:", err);
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
  fs.writeFileSync('frontend_desktop/thong-tin-ca-nhan.html', html, 'utf8');
  console.log('Successfully written frontend_desktop/thong-tin-ca-nhan.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Desktop profile orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

// ==========================================
// MOBILE PROFILE
// ==========================================
function prepareMobileProfile() {
  const orig = fs.readFileSync('frontend_mobile/mobile_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n/thong-tin-ca-nhan.html', 'utf8');
  let html = orig;

  // Email
  html = html.replace(
    '<span class="truncate">thu.tm@umc.edu.vn</span>',
    '<span id="mobile-profile-email" class="truncate">thu.tm@umc.edu.vn</span>'
  );

  // Unit
  html = html.replace(
    '<span class="truncate">Phòng Điều dưỡng<br/></span>',
    '<span id="mobile-profile-unit" class="truncate">Phòng Điều dưỡng<br/></span>'
  );

  // Script
  const authScriptTag = '<script src="../auth.js"></script>';
  const dataScript = `
<script id="mobile-profile-data-script">
(function() {
  async function init() {
    try {
      const me = await guardPage();
      if (!me) return;

      const { data: profile } = await sb
        .from("profiles")
        .select("id, display_name, email, role, phone, units(unit_name)")
        .eq("id", me.id)
        .maybeSingle();

      const user = profile || me;

      const nameEl = document.getElementById("user-name");
      if (nameEl && user.display_name) nameEl.textContent = user.display_name;

      const emailEl = document.getElementById("mobile-profile-email");
      if (emailEl && user.email) emailEl.textContent = user.email;

      const unitEl = document.getElementById("mobile-profile-unit");
      if (unitEl) {
        unitEl.textContent = (user.units && user.units.unit_name) ? user.units.unit_name : "Toàn viện";
      }

    } catch (err) {
      console.error("Lỗi mobile profile:", err);
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
  fs.writeFileSync('frontend_mobile/thong-tin-ca-nhan.html', html, 'utf8');
  console.log('Successfully written frontend_mobile/thong-tin-ca-nhan.html');

  // Verify
  const origBefore = orig.slice(0, orig.indexOf('../auth.js'));
  const curBefore = html.slice(0, html.indexOf('../auth.js'));
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log('Mobile profile orig tags:', origTags.length, 'cur tags:', curTags.length, 'diff:', curTags.length - origTags.length);
}

prepareDesktopProfile();
prepareMobileProfile();
