const fs = require('fs');
const path = require('path');

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

const MENU_ITEMS = [
  { href: 'tong-quan.html', title: 'Tổng quan', icon: 'dashboard', roles: 'secretary' },
  { href: 'danh-sach-ho-so.html', title: 'Danh sách hồ sơ &amp; Tiến độ', icon: 'view_timeline', roles: 'author,secretary' },
  { href: 'tao-ho-so.html', title: 'Tạo hồ sơ &amp; Nộp tài liệu', icon: 'post_add', roles: 'author,secretary' },
  { href: 'khong-gian-tai-lieu.html', title: 'Kho tài liệu', icon: 'folder_open', roles: 'author,secretary' },
  { href: 'ai-soat-xet.html', title: 'AI Soát xét', icon: 'auto_awesome', roles: 'secretary' },
  { href: 'hoi-dong-ban-hanh.html', title: 'Hội đồng &amp; Ban hành', icon: 'gavel', roles: 'secretary' },
  { href: 'lich-hop-hoi-dong.html', title: 'Lịch họp Hội đồng', icon: 'event_available', roles: 'secretary' },
  { href: 'thong-tin-ca-nhan.html', title: 'Thông tin cá nhân', icon: 'badge', roles: 'author,secretary' }
];

function generateNavItems(currentFile) {
  const itemsHtml = MENU_ITEMS.map(item => {
    const isActive = item.href === currentFile;
    if (isActive) {
      return `<a aria-current="page" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white text-[#083b76] font-bold shadow-md transition-all text-sm nav-item nav-link-item" data-roles="${item.roles}" href="${item.href}" title="${item.title}">
<span class="material-symbols-outlined text-[20px] text-[#083b76] shrink-0">${item.icon}</span>
<span class="sidebar-text-item sidebar-text sidebar-label truncate">${item.title}</span>
</a>`;
    } else {
      return `<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-blue-100/75 hover:bg-white/10 hover:text-white transition-all text-sm font-normal nav-item nav-link-item" data-roles="${item.roles}" href="${item.href}" title="${item.title}">
<span class="material-symbols-outlined text-[20px] shrink-0">${item.icon}</span>
<span class="sidebar-text-item sidebar-text sidebar-label truncate">${item.title}</span>
</a>`;
    }
  });

  // 9th item: Logout
  itemsHtml.push(`<a class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-blue-100/75 hover:bg-white/10 hover:text-white transition-all text-sm font-normal nav-item nav-link-item" data-action="logout" href="#" title="Đăng xuất">
<span class="material-symbols-outlined text-[20px] shrink-0">logout</span>
<span class="sidebar-text-item sidebar-text sidebar-label truncate">Đăng xuất</span>
</a>`);

  return itemsHtml.join('\n');
}

function transformContent(f, content) {
  const asideMatch = content.match(/<aside[\s\S]*?<\/aside>/i);
  if (!asideMatch) throw new Error(`No <aside> in ${f}`);
  const aside = asideMatch[0];

  const navMatch = aside.match(/<nav[\s\S]*?<\/nav>/i);
  if (!navMatch) throw new Error(`No <nav> in aside in ${f}`);

  const newItems = generateNavItems(f);

  let newNavTag = '<nav class="flex flex-col gap-1">';
  if (f === 'lich-hop-hoi-dong.html') {
    newNavTag = '<nav class="flex-1 px-space-sm py-space-xs overflow-y-auto flex flex-col gap-1" data-active-classes="bg-surface-container-lowest text-primary font-headline-sm shadow-sm">';
  } else if (f === 'thong-tin-ca-nhan.html') {
    newNavTag = '<nav class="flex flex-col gap-1 px-space-sm" data-active-classes="bg-surface-container-lowest text-primary-container font-headline-sm rounded-lg shadow-sm">';
  } else if (f === 'hoi-dong-ban-hanh.html') {
    newNavTag = '<nav class="flex-1 flex flex-col gap-1">';
  } else if (f === 'tong-quan.html') {
    newNavTag = '<nav class="flex flex-col gap-1" data-active-classes="bg-white text-[#083b76] font-semibold shadow-sm">';
  }

  const newNav = `${newNavTag}\n${newItems}\n</nav>`;
  const beforeNav = aside.slice(0, navMatch.index);
  
  let afterNav = '</div></aside>';
  if (f === 'lich-hop-hoi-dong.html') {
    afterNav = '</aside>';
  }

  const newAside = `${beforeNav}${newNav}${afterNav}`;
  const newContent = content.slice(0, asideMatch.index) + newAside + content.slice(asideMatch.index + aside.length);
  return newContent;
}

// Execute update
console.log('--- Applying sidebar updates across 8 files ---');
files.forEach(f => {
  const filePath = path.join(__dirname, '..', 'frontend_desktop', f);
  const content = fs.readFileSync(filePath, 'utf8');
  const transformed = transformContent(f, content);
  fs.writeFileSync(filePath, transformed, 'utf8');
  console.log(`[UPDATED] ${f}`);
});

console.log('--- Verification after write ---');
let allPassed = true;
files.forEach(f => {
  const filePath = path.join(__dirname, '..', 'frontend_desktop', f);
  const content = fs.readFileSync(filePath, 'utf8');
  const asideMatch = content.match(/<aside[\s\S]*?<\/aside>/i);
  if (!asideMatch) {
    console.error(`[${f}] ERROR: No aside`);
    allPassed = false;
    return;
  }
  const aside = asideMatch[0];

  const links = aside.match(/<a(?:\s+[^>]*|>)(?:(?!<a)[\s\S])*?<\/a>/gi) || [];
  if (links.length !== 9) {
    console.error(`[${f}] ERROR: Links count = ${links.length}`);
    allPassed = false;
  }
  const activeLinks = aside.match(/aria-current="page"/gi) || [];
  if (activeLinks.length !== 1) {
    console.error(`[${f}] ERROR: Active links count = ${activeLinks.length}`);
    allPassed = false;
  }
  if (!aside.includes('data-action="logout"')) {
    console.error(`[${f}] ERROR: Missing data-action="logout"`);
    allPassed = false;
  }
  if (content.includes('id="sidebar-user-card"') || content.includes("id='sidebar-user-card'")) {
    console.error(`[${f}] ERROR: Found sidebar-user-card element`);
    allPassed = false;
  }
  const userNameCount = (content.match(/id=["']user-name["']/g) || []).length;
  const userRoleCount = (content.match(/id=["']user-role["']/g) || []).length;
  if (userNameCount !== 1 || userRoleCount !== 1) {
    console.error(`[${f}] ERROR: user-name=${userNameCount}, user-role=${userRoleCount}`);
    allPassed = false;
  }
  const opens = (aside.match(/<div[\s>]/gi) || []).length;
  const closes = (aside.match(/<\/div>/gi) || []).length;
  if (opens !== closes) {
    console.error(`[${f}] ERROR: Div mismatch: ${opens} vs ${closes}`);
    allPassed = false;
  }
  if (aside.includes('Tra cứu') || aside.includes('Nhật ký')) {
    console.error(`[${f}] ERROR: Found old menu items`);
    allPassed = false;
  }
  console.log(`[VERIFIED OK] ${f} (links: ${links.length}, active: ${activeLinks.length}, user-name: ${userNameCount}, user-role: ${userRoleCount}, divs: ${opens}/${closes})`);
});

if (allPassed) {
  console.log('\n>>> ALL 8 FILES SUCCESSFULLY UPDATED AND VERIFIED! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
