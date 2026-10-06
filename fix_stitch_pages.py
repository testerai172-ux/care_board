#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_stitch_pages.py  —  Sửa cấu trúc các trang Stitch (chạy LOCAL trên máy bạn, không cần mạng, không gửi dữ liệu đi đâu).

Cách dùng (trong thư mục care_board):
    python fix_stitch_pages.py frontend_desktop
Xem trước, không ghi file:
    python fix_stitch_pages.py frontend_desktop --dry-run

Việc script làm (chỉ chỉnh chuỗi văn bản trong file .html, bỏ qua dang-nhap.html):
  1. Gỡ style cố định width:1280px/height:1024px/overflow:hidden trên thẻ <html> (nguyên nhân trang không full màn hình, mất 1 phần bảng).
  2. Xoá thẻ rác snapdom-sandbox do Stitch để lại.
  3. Xoá mục menu "Tra cứu & Báo cáo" và "Nhật ký hoạt động" (chưa có trang).
  4. Xoá khối người dùng ở chân thanh bên (id="sidebar-user-card").
  5. Thêm mục "Đăng xuất" cuối menu (cùng kiểu mục menu thường, data-action="logout").
  6. Bỏ giới hạn max-w-* / mx-auto trên thẻ <main> (nội dung tràn đầy chiều rộng).
  7. Xoá mật khẩu mẫu "CurrentSecretP@ss123" và alert đăng xuất mẫu (trang Thông tin cá nhân).
  8. Trang danh sách: nới cột "Tên tài liệu" và cột "Tiến trình 6 bước" cho khỏi bị cắt.
Bản sao lưu từng file được lưu ở thư mục ../care_board_backup_html (ngoài repo) trước khi sửa.
Chạy lại nhiều lần vẫn an toàn.
"""
import os
import re
import shutil
import sys

DRY = "--dry-run" in sys.argv
args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    print("Cách dùng: python fix_stitch_pages.py frontend_desktop [--dry-run]")
    sys.exit(1)

HERE = os.path.dirname(os.path.abspath(__file__))
BACKUP = os.path.join(os.path.dirname(HERE), os.path.basename(HERE) + "_backup_html")


def remove_balanced_div(html, marker):
    """Xoá nguyên khối <div ... marker ...> ... </div> (đếm lồng nhau)."""
    pos = html.find(marker)
    if pos < 0:
        return html, False
    start = html.rfind("<div", 0, pos)
    if start < 0:
        return html, False
    depth = 0
    for m in re.finditer(r"<div\b|</div>", html[start:]):
        depth += 1 if m.group(0) != "</div>" else -1
        if depth == 0:
            end = start + m.end()
            return html[:start] + html[end:], True
    return html, False


def remove_links_with_text(html, texts):
    changed = False
    for t in texts:
        pat = re.compile(r"<a\b[^>]*>(?:(?!</a>).)*?" + re.escape(t) + r"(?:(?!</a>).)*?</a>", re.S)
        new, n = pat.subn("", html)
        if n:
            changed = True
            html = new
    return html, changed


def add_logout_item(html):
    if re.search(r"<a\b[^>]*data-action=[\"']logout[\"']", html):
        return html, False  # đã có
    nav = re.search(r"<nav\b[^>]*>.*?</nav>", html, re.S)
    if not nav:
        return html, False
    nav_html = nav.group(0)
    anchors = list(re.finditer(r"<a\b[^>]*>.*?</a>", nav_html, re.S))
    tmpl = None
    for a in reversed(anchors):
        s = a.group(0)
        cls = re.search(r"class=\"([^\"]*)\"", s)
        classes = (cls.group(1) if cls else "").split()
        if "aria-current" in s or "shadow-md" in classes or "bg-white" in classes \
                or "bg-surface-container-lowest" in classes:
            continue  # bỏ qua mục đang "active"
        if "<div" in s or s.count("<span") != 2:
            continue
        tmpl = s
        break
    if tmpl is None:
        return html, False
    item = tmpl
    # bỏ các thuộc tính phân quyền/định danh, đặt href="#" và data-action
    item = re.sub(r"\sdata-roles=\"[^\"]*\"", "", item)
    item = re.sub(r"\sdata-path=\"[^\"]*\"", "", item)
    item = re.sub(r"\saria-current=\"[^\"]*\"", "", item)
    item = re.sub(r"\stitle=\"[^\"]*\"", "", item)
    item = re.sub(r"\shref=\"[^\"]*\"", ' href="#" data-action="logout" title="Đăng xuất"', item, count=1)
    # đổi icon và nhãn (2 thẻ <span>: icon, nhãn)
    spans = list(re.finditer(r"(<span\b[^>]*>)(.*?)(</span>)", item, re.S))
    if len(spans) >= 2:
        icon, label = spans[0], spans[1]
        item = (item[:label.start(2)] + "Đăng xuất" + item[label.end(2):])
        item = (item[:icon.start(2)] + "logout" + item[icon.end(2):])
    new_nav = nav_html[: nav_html.rfind("</nav>")] + item + "</nav>"
    return html.replace(nav_html, new_nav, 1), True


def fix_html_tag(html):
    m = re.search(r"<html\b[^>]*>", html)
    if not m:
        return html, False
    tag = m.group(0)
    new = re.sub(r"\sstyle=\"[^\"]*\"", "", tag)
    if new != tag:
        return html.replace(tag, new, 1), True
    return html, False


def fix_main_tag(html):
    m = re.search(r"<main\b[^>]*>", html)
    if not m:
        return html, False
    tag = m.group(0)
    new = re.sub(r"\s(?:max-w-(?:screen-)?(?:[0-9a-z]+|\[[^\]]+\]))(?=[\s\"])", "", tag)
    new = re.sub(r"\smx-auto(?=[\s\"])", "", new)
    if new != tag:
        return html.replace(tag, new, 1), True
    return html, False


def process(path):
    with open(path, encoding="utf-8") as f:
        src = f.read()
    html = src
    done = []

    html, ok = fix_html_tag(html)
    if ok: done.append("gỡ style cố định ở <html>")

    new = re.sub(r"<div\b[^>]*data-snapdom-sandbox[^>]*>\s*</div>", "", html)
    if new != html:
        html, done = new, done + ["xoá thẻ snapdom-sandbox"]

    html, ok = remove_links_with_text(html, ["Tra cứu &amp; Báo cáo", "Tra cứu & Báo cáo", "Nhật ký hoạt động"])
    if ok: done.append("xoá 2 mục menu chưa có trang")

    html, ok = remove_balanced_div(html, 'id="sidebar-user-card"')
    if ok: done.append("xoá khối người dùng chân thanh bên")

    html, ok = add_logout_item(html)
    if ok: done.append("thêm mục Đăng xuất")

    html, ok = fix_main_tag(html)
    if ok: done.append("bỏ giới hạn max-w/mx-auto ở <main>")

    new = html.replace(' value="CurrentSecretP@ss123"', "")
    if new != html:
        html, done = new, done + ["xoá mật khẩu mẫu"]

    new = re.sub(r"\n?\s*alert\('Đã đăng xuất phiên làm việc an toàn\.'\);", "", html)
    if new != html:
        html, done = new, done + ["xoá alert đăng xuất mẫu"]

    new = html.replace("align-top max-w-xs", "align-top min-w-[240px] max-w-md")
    new = new.replace("text-center min-w-[210px]", "text-center min-w-[280px]")
    if new != html:
        html, done = new, done + ["nới cột Tên tài liệu / Tiến trình"]

    changed = html != src
    if changed and not DRY:
        rel = os.path.relpath(path, HERE)
        bpath = os.path.join(BACKUP, rel)
        os.makedirs(os.path.dirname(bpath), exist_ok=True)
        if not os.path.exists(bpath):
            shutil.copy2(path, bpath)
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(html)
    return done


def main():
    for folder in args:
        fdir = os.path.join(HERE, folder) if not os.path.isabs(folder) else folder
        if not os.path.isdir(fdir):
            print(f"[!] Không thấy thư mục: {fdir}")
            continue
        print(f"=== {folder} {'(chạy thử, KHÔNG ghi file)' if DRY else ''}")
        for name in sorted(os.listdir(fdir)):
            if not name.endswith(".html") or name == "dang-nhap.html":
                continue
            done = process(os.path.join(fdir, name))
            print(f"  {name}: " + ("; ".join(done) if done else "không cần sửa"))
    if not DRY:
        print(f"\nBản sao lưu (trước khi sửa): {BACKUP}")


main()
