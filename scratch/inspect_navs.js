const fs = require('fs');

const files = [
  'tong-quan.html',
  'danh-sach-ho-so.html',
  'tao-ho-so.html',
  'khong-gian-tai-lieu.html',
  'ai-soat-xet.html',
  'hoi-dong-ban-hanh.html',
  'lich-hop-hoi-dong.html',
  'thong-tin-ca-nhan.html'
];

files.forEach(f => {
  const content = fs.readFileSync('frontend_desktop/' + f, 'utf8');
  const navMatch = content.match(/<nav[\s\S]*?<\/nav>/i);
  console.log(`\n========================================\n[${f}] NAV:`);
  if (navMatch) {
    console.log(navMatch[0]);
  } else {
    console.log('NO NAV FOUND');
  }
});
