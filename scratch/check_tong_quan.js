const fs = require('fs');
const orig = fs.readFileSync('frontend_desktop/desktop_t_ng_quan_dashboard_qu_n_tr_t_i_li_u/tong-quan.html', 'utf8');

console.log('User name in header:', orig.match(/Chào buổi sáng[^<]*/));
console.log('Urgent card 1 title:', orig.match(/QTKT-2026-003[^<]*/));
console.log('Urgent card 2 title:', orig.match(/HDCS-2026-007[^<]*/));
console.log('Urgent card 3 title:', orig.match(/Thứ Năm, 26\/03[^<]*/));
const numbers = orig.match(/<span class="text-3xl font-extrabold[^>]*>\d+<\/span>/g);
console.log('5 KPI card numbers:', numbers);

// Check sections for "Công việc cần xử lý ngay"
const urgentTasksMatch = orig.indexOf('Công việc cần xử lý ngay');
console.log('urgentTasks section snippet:');
console.log(orig.slice(urgentTasksMatch, urgentTasksMatch + 1000));
