const fs = require('fs');

function prettyPrintStructure(file) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`=== ${file} ===`);
  // Find major containers inside <main>
  const mainMatch = content.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) {
    console.log('No <main> found');
    return;
  }
  const main = mainMatch[0];
  // Find all sections or cards
  const headers = main.match(/<(h[1-6]|span|div)[^>]*>(.*?)<\/\1>/gi) || [];
  console.log('Sample content snippets:');
  headers.slice(0, 30).forEach(h => {
    if (h.length < 150) console.log('  ', h.replace(/\s+/g, ' '));
  });
}

prettyPrintStructure('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html');
prettyPrintStructure('frontend_desktop/desktop_l_ch_h_p_h_i_ng_i_u_d_ng/lich-hop-hoi-dong.html');
prettyPrintStructure('frontend_desktop/desktop_ai_so_t_x_t_chuy_n_m_n_t_ng/ai-soat-xet.html');
prettyPrintStructure('frontend_desktop/desktop_h_i_ng_ban_h_nh_v_n_b_n/hoi-dong-ban-hanh.html');
