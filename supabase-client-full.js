// =============================================================================
// CARE BOARD — Supabase client (khớp bộ 17 bảng thật trong file zip bạn đã tạo)
// Nhúng SAU thẻ <script> CDN của supabase-js trong index.html.
// Giả định có <div id="board"></div> để render Kanban.
// Nếu index.html thật của bạn có ID/class khác, gửi file đó để tôi chỉnh khớp.
// =============================================================================

// --- 1. Cấu hình kết nối ----------------------------------------------------
// Supabase Dashboard > Project Settings > API > Project URL & anon public key
const SUPABASE_URL = "https://isithnzgluzamvnzhlaa.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzaXRobnpnbHV6YW12bnpobGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2OTA3MzIsImV4cCI6MjEwNTI2NjczMn0.V3poitUPJvEpjWvEi7KbFTszgqq8HIwbqFBwxLKVrNE";

// Cần thêm TRƯỚC file này trong index.html:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BOARD_CONTAINER_ID = "board";

// --- 2. Thứ tự cột hiển thị — đúng 14 trạng thái đang có trong dữ liệu mẫu,
//    được nhóm lại theo đúng 6 khối của lưu đồ ---------------------------
const STATUS_COLUMNS = [
  { group: "Lập kế hoạch",              statuses: ["Kế hoạch"] },
  { group: "Thực hiện xây dựng",        statuses: ["Đang soạn thảo", "Đã nộp", "Chờ tiếp nhận"] },
  { group: "Soát xét tài liệu",         statuses: ["Đang soát xét", "Cần bổ sung", "Đạt — Chờ HĐĐD"] },
  { group: "Trình HĐĐD xét duyệt",      statuses: ["HĐĐD thông qua", "HĐĐD thông qua có chỉnh sửa", "Không thông qua"] },
  { group: "Xây dựng lại (chưa thông qua)", statuses: ["Cần hoàn chỉnh"] },
  { group: "Hoàn chỉnh & ban hành",     statuses: ["Đã hoàn chỉnh", "Trình phê duyệt", "Đã ban hành"] },
];

// --- 3. Lấy dữ liệu từ bảng "processes" (bảng trung tâm) cùng đơn vị & tác giả
async function fetchProcesses() {
  const { data, error } = await supabase
    .from("processes")
    .select(`
      id, process_id, document_code, document_name, document_type, status,
      priority, current_version, review_deadline, issued_at,
      units ( unit_name ),
      profiles ( display_name )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Lỗi khi tải danh sách hồ sơ:", error);
    return [];
  }
  return data;
}

// --- 4. Vẽ Kanban theo nhóm 6 khối của lưu đồ -------------------------------
function renderBoard(processes) {
  const container = document.getElementById(BOARD_CONTAINER_ID);
  if (!container) {
    console.warn(`Không tìm thấy #${BOARD_CONTAINER_ID} trong index.html`);
    return;
  }

  container.innerHTML = STATUS_COLUMNS.map((col) => {
    const items = processes.filter((p) => col.statuses.includes(p.status));
    const cards = items
      .map(
        (p) => `
        <div class="care-card" data-id="${p.id}">
          <div class="care-card-code">${p.process_id}</div>
          <div class="care-card-title">${p.document_name}</div>
          <div class="care-card-status">${p.status}</div>
          <div class="care-card-meta">
            ${p.units?.unit_name ?? ""} · ${p.profiles?.display_name ?? ""}
          </div>
          <div class="care-card-due">Hạn soát xét: ${p.review_deadline ?? "—"}</div>
        </div>`
      )
      .join("");

    return `
      <div class="care-column">
        <h3>${col.group} <span class="care-count">${items.length}</span></h3>
        <div class="care-column-body">${cards || '<p class="care-empty">Không có hồ sơ</p>'}</div>
      </div>`;
  }).join("");
}

// --- 5. Realtime: tự làm mới khi có ai thêm/sửa hồ sơ -----------------------
function subscribeRealtime() {
  supabase
    .channel("processes-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "processes" }, () => {
      refreshBoard();
    })
    .subscribe();
}

// --- 6. Khởi chạy ------------------------------------------------------------
async function refreshBoard() {
  const processes = await fetchProcesses();
  renderBoard(processes);
}

document.addEventListener("DOMContentLoaded", () => {
  refreshBoard();
  subscribeRealtime();
});
