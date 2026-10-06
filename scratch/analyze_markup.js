const fs = require('fs');

const desktopMap = {
  'tong-quan.html': 'desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u',
  'danh-sach-ho-so.html': 'desktop_danh_s_ch_h_s_ti_n_workflow',
  'tao-ho-so.html': 'desktop_t_o_h_s_n_p_t_i_li_u_m_i',
  'khong-gian-tai-lieu.html': 'desktop_document_workspace_qtkt_2026_001',
  'ai-soat-xet.html': 'desktop_ai_so_t_x_t_chuy_n_m_n_t_ng',
  'lich-hop-hoi-dong.html': 'desktop_l_ch_h_p_h_i_ng_i_u_d_ng',
  'hoi-dong-ban-hanh.html': 'desktop_h_i_ng_ban_h_nh_v_n_b_n',
  'thong-tin-ca-nhan.html': 'desktop_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n',
  'dang-nhap.html': 'desktop_ng_nh_p_c_n_b_y_t_doc_care_gov'
};

const mobileMap = {
  'tong-quan.html': 'mobile_t_ng_quan_dashboard_qu_n_tr',
  'danh-sach-ho-so.html': 'mobile_danh_s_ch_h_s_ti_n',
  'tao-ho-so.html': 'mobile_t_o_h_s_n_p_t_i_li_u',
  'khong-gian-tai-lieu.html': 'mobile_kho_t_i_li_u_workspace',
  'ai-soat-xet.html': 'mobile_ai_so_t_x_t_chuy_n_m_n_t_ng',
  'lich-hop-hoi-dong.html': 'mobile_l_ch_h_p_h_i_ng_i_u_d_ng',
  'hoi-dong-ban-hanh.html': 'mobile_h_i_ng_ban_h_nh_v_n_b_n',
  'thong-tin-ca-nhan.html': 'mobile_th_ng_tin_c_nh_n_qu_n_l_t_i_kho_n',
  'dang-nhap.html': 'mobile_ng_nh_p_c_n_b_y_t'
};

function getBodyWithoutAuthScript(html) {
  const bodyStart = html.indexOf('<body');
  if (bodyStart === -1) return html;
  let bodyEnd = html.indexOf('<script src="../auth.js"');
  if (bodyEnd === -1) {
    bodyEnd = html.indexOf('<script src="auth.js"');
  }
  if (bodyEnd === -1) {
    bodyEnd = html.lastIndexOf('</body>');
  }
  return html.substring(bodyStart, bodyEnd > -1 ? bodyEnd : html.length);
}

function analyze(dir, map) {
  console.log('=== ' + dir + ' ===');
  for (const [file, sub] of Object.entries(map)) {
    const curPath = dir + '/' + file;
    const origPath = dir + '/' + sub + '/' + file;
    const curHtml = fs.readFileSync(curPath, 'utf8');
    const origHtml = fs.readFileSync(origPath, 'utf8');

    const curBody = getBodyWithoutAuthScript(curHtml);
    const origBody = getBodyWithoutAuthScript(origHtml);

    const curDivs = (curBody.match(/<div\b/g) || []).length;
    const origDivs = (origBody.match(/<div\b/g) || []).length;

    console.log(file.padEnd(25) + ' | divs: orig=' + origDivs + ', cur=' + curDivs + ' | body length: orig=' + origBody.length + ', cur=' + curBody.length + ', diff=' + (curBody.length - origBody.length));
  }
}

analyze('frontend_desktop', desktopMap);
analyze('frontend_mobile', mobileMap);
