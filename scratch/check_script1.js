const fs = require('fs');
const orig = fs.readFileSync('frontend_desktop/desktop_h_i_ng_ban_h_nh_v_n_b_n/hoi-dong-ban-hanh.html', 'utf8');
const s = orig.match(/<script id="tailwind-config">([\s\S]*?)<\/script>/i)[1];
const open = (s.match(/{/g) || []).length;
const close = (s.match(/}/g) || []).length;
console.log('Open:', open, 'Close:', close);
