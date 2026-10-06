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
  if (!asideMatch) return console.log(f, 'NO ASIDE');
  const links = asideMatch[0].match(/<a(?:\s+[^>]*|>)(?:(?!<a)[\s\S])*?<\/a>/gi) || [];
  console.log(`\n=== ${f} (total links: ${links.length}) ===`);
  links.forEach(l => {
    const href = (l.match(/href=["']([^"']*)["']/) || [])[1];
    const text = l.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`  href: ${href} | text: ${text}`);
  });
});
