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
  console.log(`\n========================================\n[${f}]`);

  const nameMatches = content.match(/id=["']user-name["']/g) || [];
  const roleMatches = content.match(/id=["']user-role["']/g) || [];

  console.log('Count id="user-name":', nameMatches.length);
  console.log('Count id="user-role":', roleMatches.length);

  // Find where they are located
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('id="user-name"') || line.includes("id='user-name'")) {
      console.log(`  Line ${i+1} [user-name]: ${line.trim().slice(0, 120)}`);
    }
    if (line.includes('id="user-role"') || line.includes("id='user-role'")) {
      console.log(`  Line ${i+1} [user-role]: ${line.trim().slice(0, 120)}`);
    }
  });

  // Check top header content
  const headerMatch = content.match(/<header[\s\S]*?<\/header>/i);
  if (headerMatch) {
    const h = headerMatch[0];
    const hasName = h.includes('user-name') || h.includes('Trần Minh Thư') || h.includes('minh.thu');
    const hasRole = h.includes('user-role') || h.includes('Thư ký') || h.includes('secretary');
    console.log(`  Header has name: ${hasName}, has role: ${hasRole}`);
    // print snippet around name/role in header
    const idx = h.indexOf('Trần Minh Thư');
    if (idx > -1) {
      console.log('  Header snippet:\n  ' + h.slice(Math.max(0, idx - 100), idx + 200).replace(/\n/g, ' '));
    }
  } else {
    console.log('  No <header> element in this file');
    // Check if there is a top bar or section
    const topBar = content.match(/<div[^>]*class="[^"]*?(?:top-0|sticky|h-16|border-b)[^"]*?"[\s\S]*?<\/div>/i);
    if (topBar) {
      console.log('  Top bar snippet:', topBar[0].slice(0, 200));
    }
  }
});
