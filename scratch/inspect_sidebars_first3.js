const fs = require('fs');

const files = [
  'tong-quan.html',
  'danh-sach-ho-so.html',
  'tao-ho-so.html'
];

files.forEach(f => {
  const content = fs.readFileSync('frontend_desktop/' + f, 'utf8');
  const asideMatch = content.match(/<aside[\s\S]*?<\/aside>/i);
  if (!asideMatch) return;
  const aside = asideMatch[0];
  console.log(`\n========================================\n[${f}]`);
  
  const links = aside.match(/<a[\s\S]*?<\/a>/gi) || [];
  console.log('Total <a> in aside:', links.length);
  links.forEach(l => {
    const href = l.match(/href=["'](.*?)["']/);
    const icon = l.match(/<span class="material-symbols-outlined[^>]*>(.*?)<\/span>/);
    const text = l.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`  href: ${href ? href[1] : 'none'} | icon: ${icon ? icon[1] : 'none'} | text: ${text}`);
  });
});
