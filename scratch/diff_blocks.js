const fs = require('fs');

function showDiffBlocks(file1, file2) {
  const orig = fs.readFileSync(file1, 'utf8').slice(0, fs.readFileSync(file1, 'utf8').indexOf('../auth.js'));
  const cur = fs.readFileSync(file2, 'utf8').slice(0, fs.readFileSync(file2, 'utf8').indexOf('../auth.js'));

  const origLines = orig.split('\n');
  const curLines = cur.split('\n');

  console.log(`=== Compare ${file2} with ${file1} ===`);
  // Print sections where lengths or tags differ
  const origTables = (orig.match(/<table[\s\S]*?<\/table>/gi) || []).map(t => t.length);
  const curTables = (cur.match(/<table[\s\S]*?<\/table>/gi) || []).map(t => t.length);
  console.log('Tables: orig=' + origTables.length + ', cur=' + curTables.length);

  // Check stat card counts
  console.log('Orig total chars:', orig.length, 'Cur total chars:', cur.length);
}

showDiffBlocks('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html', 'frontend_desktop/tong-quan.html');
showDiffBlocks('frontend_desktop/desktop_lich-hop-hoi-dong.html' ? 'frontend_desktop/desktop_l_ch_h_p_h_i_ng_i_u_d_ng/lich-hop-hoi-dong.html' : '', 'frontend_desktop/lich-hop-hoi-dong.html');
showDiffBlocks('frontend_desktop/desktop_ai_so_t_x_t_chuy_n_m_n_t_ng/ai-soat-xet.html', 'frontend_desktop/ai-soat-xet.html');
showDiffBlocks('frontend_desktop/desktop_h_i_ng_ban_h_nh_v_n_b_n/hoi-dong-ban-hanh.html', 'frontend_desktop/hoi-dong-ban-hanh.html');
