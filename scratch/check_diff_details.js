const fs = require('fs');

const desktopMap = {
  'dang-nhap.html': 'desktop_ng_nh_p_c_n_b_y_t_doc_care_gov',
  'tong-quan.html': 'desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u',
  'danh-sach-ho-so.html': 'desktop_danh_s_ch_h_s_ti_n_workflow',
  'tao-ho-so.html': 'desktop_t_o_h_s_n_p_t_i_li_u_m_i',
  'khong-gian-tai-lieu.html': 'desktop_document_workspace_qtkt_2026_001',
  'ai-soat-xet.html': 'desktop_ai_so_t_x_t_chuy_n_m_n_t_ng',
  'lich-hop-hoi-dong.html': 'desktop_l_ch_h_p_h_i_ng_i_u_d_ng',
  'hoi-dong-ban-hanh.html': 'desktop_h_i_ng_ban_h_nh_v_n_b_n',
  'thong-tin-ca-nhan.html': 'desktop_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n'
};

const mobileMap = {
  'dang-nhap.html': 'mobile_ng_nh_p_c_n_b_y_t',
  'tong-quan.html': 'mobile_t_ng_quan_dashboard_qu_n_tr',
  'danh-sach-ho-so.html': 'mobile_danh_s_ch_h_s_ti_n',
  'tao-ho-so.html': 'mobile_t_o_h_s_n_p_t_i_li_u',
  'khong-gian-tai-lieu.html': 'mobile_kho_t_i_li_u_workspace',
  'ai-soat-xet.html': 'mobile_ai_so_t_x_t_chuy_n_m_n_t_ng',
  'lich-hop-hoi-dong.html': 'mobile_l_ch_h_p_h_i_ng_i_u_d_ng',
  'hoi-dong-ban-hanh.html': 'mobile_h_i_ng_ban_h_nh_v_n_b_n',
  'thong-tin-ca-nhan.html': 'mobile_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n'
};

function analyzeOne(dir, file, sub) {
  const curPath = dir + '/' + file;
  const origPath = dir + '/' + sub + '/' + file;
  const cur = fs.readFileSync(curPath, 'utf8');
  const orig = fs.readFileSync(origPath, 'utf8');

  const curAuthIdx = cur.indexOf('../auth.js');
  const origAuthIdx = orig.indexOf('../auth.js');

  const curBefore = curAuthIdx > -1 ? cur.slice(0, curAuthIdx) : cur;
  const origBefore = origAuthIdx > -1 ? orig.slice(0, origAuthIdx) : orig;

  console.log(`\n========================================\n[${dir}/${file}]`);
  console.log(`orig len before auth: ${origBefore.length}, cur len before auth: ${curBefore.length}, diff: ${curBefore.length - origBefore.length}`);
  
  // Let's count elements
  const origTags = (origBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  const curTags = (curBefore.match(/<[a-zA-Z0-9\-]+/g) || []);
  console.log(`orig tags count: ${origTags.length}, cur tags count: ${curTags.length}`);
}

console.log('--- DESKTOP ---');
for (const [f, sub] of Object.entries(desktopMap)) {
  analyzeOne('frontend_desktop', f, sub);
}

console.log('--- MOBILE ---');
for (const [f, sub] of Object.entries(mobileMap)) {
  analyzeOne('frontend_mobile', f, sub);
}
