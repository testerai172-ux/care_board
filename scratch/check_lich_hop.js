const fs = require('fs');
const orig = fs.readFileSync('frontend_desktop/desktop_l_ch_h_p_h_i_ng_i_u_d_ng/lich-hop-hoi-dong.html', 'utf8');

const numbers = orig.match(/<h2 class="font-display text-display[^>]*>\d+<\/h2>/g);
console.log('Stats in orig lich-hop:', numbers);

const cIdx = orig.indexOf('14:00 - 16:00, Thứ Sáu');
console.log('Sample meeting card around:');
console.log(orig.slice(cIdx - 400, cIdx + 400));
