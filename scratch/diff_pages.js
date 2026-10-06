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

function compareMarkup(name, curFile, origFile) {
  const curHtml = fs.readFileSync(curFile, 'utf8');
  const origHtml = fs.readFileSync(origFile, 'utf8');

  const curBeforeAuth = curHtml.split(/<script\s+src=["']\.\.\/auth\.js["']/)[0];
  const origBeforeAuth = origHtml.split(/<script\s+src=["']\.\.\/auth\.js["']/)[0];

  console.log(`\n========================================\n[${name}]\nCur len: ${curBeforeAuth.length}, Orig len: ${origBeforeAuth.length}`);
  
  // Find where they first differ
  let firstDiff = -1;
  const minLen = Math.min(curBeforeAuth.length, origBeforeAuth.length);
  for (let i = 0; i < minLen; i++) {
    if (curBeforeAuth[i] !== origBeforeAuth[i]) {
      firstDiff = i;
      break;
    }
  }

  if (firstDiff === -1 && curBeforeAuth.length === origBeforeAuth.length) {
    console.log('=> EXACT MATCH before auth.js!');
  } else {
    console.log(`=> First diff at index ${firstDiff}:`);
    const start = Math.max(0, firstDiff - 80);
    console.log('ORIG around diff:\n' + origBeforeAuth.slice(start, firstDiff + 150));
    console.log('CUR around diff:\n' + curBeforeAuth.slice(start, firstDiff + 150));
  }
}

for (const [f, sub] of Object.entries(desktopMap)) {
  compareMarkup('desktop/' + f, 'frontend_desktop/' + f, 'frontend_desktop/' + sub + '/' + f);
}

for (const [f, sub] of Object.entries(mobileMap)) {
  compareMarkup('mobile/' + f, 'frontend_mobile/' + f, 'frontend_mobile/' + sub + '/' + f);
}
