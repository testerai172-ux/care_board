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
  console.log(`\n========================================\n[${f}]`);
  
  // Extract nav links
  const links = aside.match(/<a[\s\S]*?<\/a>/gi) || [];
  console.log('Total <a> in aside:', links.length);
  links.forEach(l => {
    // print href and text/icon
    const href = l.match(/href=["'](.*?)["']/);
    const icon = l.match(/<span class="material-symbols-outlined[^>]*>(.*?)<\/span>/);
    const text = l.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`  href: ${href ? href[1] : 'none'} | icon: ${icon ? icon[1] : 'none'} | text: ${text}`);
  });

  // Check footer of aside
  const footerMatch = aside.match(/<div class="[^"]*?(?:border-t|mt-auto|p-)[^"]*?">\s*<div class="flex items-center gap-[^"]*?">[\s\S]*?<\/aside>/i);
  if (footerMatch) {
    console.log('Footer detected in aside (chars: ' + footerMatch[0].length + ')');
  } else {
    // check how footer looks
    const bottomAside = aside.slice(-800);
    console.log('Bottom 800 chars of aside:\n' + bottomAside);
  }

  // Check top-right header for user name
  const headerMatch = content.match(/<header[\s\S]*?<\/header>/i);
  if (headerMatch) {
    console.log('Header found (len ' + headerMatch[0].length + ')');
    const header = headerMatch[0];
    const userSpans = header.match(/<(?:span|div|p|h\d)[^>]*>(?:[^<]*?(?:Trần Minh Thư|Thư ký|minh\.thu|user-name|user-role)[^<]*?)<\/(?:span|div|p|h\d)>/gi) || [];
    console.log('  Header user matches:', userSpans);
  } else {
    console.log('No <header> tag found');
  }
});
