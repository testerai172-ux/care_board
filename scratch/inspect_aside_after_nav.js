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
  const asideMatch = content.match(/<aside[\s\S]*?<\/aside>/i);
  if (!asideMatch) return;
  const aside = asideMatch[0];
  const navEndIdx = aside.indexOf('</nav>') + 6;
  const afterNav = aside.slice(navEndIdx);
  console.log(`\n========================================\n[${f}] AFTER NAV:`);
  console.log(afterNav);
});
