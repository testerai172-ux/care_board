// =============================================================================
// auth.js — Đăng nhập + phân quyền giao diện theo vai trò (author / secretary)
// Nhúng vào MỌI trang (trừ login.html cũng nhúng, xem hướng dẫn):
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//   <script src="config.js"></script>   <!-- chứa SUPABASE_URL + SUPABASE_ANON_KEY -->
//   <script src="auth.js"></script>
//
// QUAN TRỌNG: ẩn menu/trang ở đây chỉ là TRẢI NGHIỆM người dùng.
// Bảo mật thật nằm ở RLS trong Supabase (file rls_roles.sql) — vì code JS trên
// GitHub Pages là công khai, ai cũng có thể mở thẳng đường dẫn trang hoặc sửa JS.
// =============================================================================

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Cấu hình: trang nào vai trò nào được vào ----
// Tên file = tên bạn đặt sau khi đổi tên (xem hướng dẫn: mỗi trang Stitch -> 1 file .html gọn tên,
// đặt trong 2 thư mục frontend_desktop/ và frontend_mobile/ với CÙNG tên file).
// Trang không liệt kê = mọi người đã đăng nhập đều vào được.
const PAGE_ROLES = {
  "danh-sach-ho-so.html":     ["author", "secretary"],
  "tao-ho-so.html":           ["author", "secretary"],
  "khong-gian-tai-lieu.html": ["author", "secretary"],
  "thong-tin-ca-nhan.html":   ["author", "secretary"],
  "tong-quan.html":           ["secretary"],
  "ai-soat-xet.html":         ["secretary"],
  "hoi-dong-ban-hanh.html":   ["secretary"],
  "lich-hop-hoi-dong.html":   ["secretary"],
};
const HOME_BY_ROLE = { author: "danh-sach-ho-so.html", secretary: "tong-quan.html" };
const LOGIN_PAGE = "dang-nhap.html";

// Tự chuyển giữa bản desktop/ và mobile/ theo độ rộng màn hình (cùng tên file ở 2 thư mục)
(function switchByDevice() {
  const path = window.location.pathname;
  const isMobileScreen = window.innerWidth < 768;
  if (isMobileScreen && path.includes("/frontend_desktop/")) window.location.replace(path.replace("/frontend_desktop/", "/frontend_mobile/"));
  if (!isMobileScreen && path.includes("/frontend_mobile/")) window.location.replace(path.replace("/frontend_mobile/", "/frontend_desktop/"));
})();

// ---- Lấy vai trò của người đang đăng nhập (đọc từ bảng profiles, đã có RLS) ----
async function getMyProfile() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, email, role")
    .eq("auth_user_id", session.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function login(email, password) {
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  const me = await getMyProfile();
  if (!me) {
    await sb.auth.signOut();
    return { ok: false, message: "Tài khoản chưa được gắn hồ sơ người dùng (profiles). Liên hệ quản trị." };
  }
  window.location.href = HOME_BY_ROLE[me.role] || "index.html";
  return { ok: true };
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = LOGIN_PAGE;
}

// ---- Gọi ở mỗi trang: chặn vào sai trang + ẩn thành phần không thuộc vai trò ----
async function guardPage() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  if (page === LOGIN_PAGE) return null;

  const me = await getMyProfile();
  if (!me) { window.location.href = LOGIN_PAGE; return null; }

  const allowed = PAGE_ROLES[page];
  if (allowed && !allowed.includes(me.role)) {
    window.location.href = HOME_BY_ROLE[me.role] || LOGIN_PAGE;
    return null;
  }

  // Ẩn mọi phần tử có data-roles không chứa vai trò hiện tại.
  // Ví dụ: <a href="ai-review.html" data-roles="secretary">AI Review</a>
  document.querySelectorAll("[data-roles]").forEach((el) => {
    const roles = el.getAttribute("data-roles").split(",").map((s) => s.trim());
    if (!roles.includes(me.role)) el.remove();
  });

  // Hiển thị tên + vai trò nếu trang có các phần tử này
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = me.display_name;
  const roleEl = document.getElementById("user-role");
  if (roleEl) roleEl.textContent = me.role === "secretary" ? "Thư ký hội đồng" : "Người dùng";
  document.querySelectorAll("[data-action='logout']").forEach((el) =>
    el.addEventListener("click", (e) => { e.preventDefault(); logout(); })
  );

  window.CURRENT_USER = me;
  return me;
}

document.addEventListener("DOMContentLoaded", guardPage);
