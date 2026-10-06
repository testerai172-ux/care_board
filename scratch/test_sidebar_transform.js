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

  // Generate new nav items
  const newItems = generateNavItems(f);

  // Determine nav tag
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

  // Replace from navMatch.index to end of aside
  const beforeNav = aside.slice(0, navMatch.index);
  
  // What should close the aside?
  let afterNav = '</div></aside>';
  if (f === 'lich-hop-hoi-dong.html') {
    afterNav = '</aside>';
  }

  const newAside = `${beforeNav}${newNav}${afterNav}`;

  const newContent = content.slice(0, asideMatch.index) + newAside + content.slice(asideMatch.index + aside.length);
  return newContent;
}

// Dry run and verify
let allValid = true;
files.forEach(f => {
  const filePath = path.join(__dirname, '..', 'frontend_desktop', f);
  const content = fs.readFileSync(filePath, 'utf8');
  const transformed = transformContent(f, content);

  const asideMatch = transformed.match(/<aside[\s\S]*?<\/aside>/i);
  if (!asideMatch) {
    console.error(`[${f}] FAILED: No aside`);
    allValid = false;
    return;
  }
  const aside = asideMatch[0];

  // 1. Check link count in aside
  const links = aside.match(/<a(?:\s+[^>]*|>)(?:(?!<a)[\s\S])*?<\/a>/gi) || [];
  if (links.length !== 9) {
    console.error(`[${f}] FAILED: Expected 9 links, got ${links.length}`);
    allValid = false;
  }

  // 2. Check active link
  const activeLinks = aside.match(/aria-current="page"/gi) || [];
  if (activeLinks.length !== 1) {
    console.error(`[${f}] FAILED: Expected 1 active link, got ${activeLinks.length}`);
    allValid = false;
  }

  // 3. Check logout link
  if (!aside.includes('data-action="logout"')) {
    console.error(`[${f}] FAILED: No data-action="logout"`);
    allValid = false;
  }

  // 4. Check no #sidebar-user-card element
  if (transformed.includes('id="sidebar-user-card"') || transformed.includes("id='sidebar-user-card'")) {
    console.error(`[${f}] FAILED: Still contains sidebar-user-card element`);
    allValid = false;
  }

  // 5. Check user-name and user-role count
  const userNameCount = (transformed.match(/id=["']user-name["']/g) || []).length;
  const userRoleCount = (transformed.match(/id=["']user-role["']/g) || []).length;
  if (userNameCount !== 1 || userRoleCount !== 1) {
    console.error(`[${f}] FAILED: userNameCount=${userNameCount}, userRoleCount=${userRoleCount}`);
    allValid = false;
  }

  // 6. Check div balance in aside
  const opens = (aside.match(/<div[\s>]/gi) || []).length;
  const closes = (aside.match(/<\/div>/gi) || []).length;
  if (opens !== closes) {
    console.error(`[${f}] FAILED: Unbalanced divs: ${opens} opens vs ${closes} closes`);
    allValid = false;
  }

  // 7. Check no Tra cứu & Báo cáo or Nhật ký hoạt động in aside
  if (aside.includes('Tra cứu') || aside.includes('Nhật ký')) {
    console.error(`[${f}] FAILED: Still contains old items`);
    allValid = false;
  }

  console.log(`[${f}] PASSED: 9 links, 1 active, logout present, user-name: ${userNameCount}, user-role: ${userRoleCount}, divs balanced (${opens}/${closes})`);
});

if (allValid) {
  console.log('\nALL CHECKS PASSED SUCCESSFULLY!');
} else {
  console.log('\nSOME CHECKS FAILED!');
}
