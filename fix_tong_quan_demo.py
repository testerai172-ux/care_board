# Dat lai so lieu demo cho tong-quan.html (khong dung mang, khong doc du lieu that).
# Dung: python fix_tong_quan_demo.py frontend_desktop\tong-quan.html [--dry-run]
import re, sys, shutil, pathlib

if len(sys.argv) < 2:
    sys.exit("Cach dung: python fix_tong_quan_demo.py <duong_dan_tong-quan.html> [--dry-run]")
p = pathlib.Path(sys.argv[1]).resolve(); dry = "--dry-run" in sys.argv
s = p.read_text(encoding="utf-8"); o = s

# (nhan the, so moi, chu phu moi hoac None)
KPI = [("Tổng KH 2026", "40", "91% chỉ tiêu"),
       ("Chờ soát xét", "08", None),
       ("Đang họp HĐĐD", "05", None),
       ("Cần hoàn thiện", "03", None),
       ("Đã ban hành", "14", None)]
num = re.compile(r'(<span class="[^"]*text-3xl[^"]*"[^>]*>)([^<]*)(</span>)')
for label, val, sub in KPI:
    i = s.lower().find(label.lower())
    if i < 0: print("! Khong thay the:", label); continue
    m = num.search(s, i)
    if not m or m.start() - i > 1500: print("! Khong thay o so cua:", label); continue
    s = s[:m.start()] + m.group(1) + val + m.group(3) + s[m.end():]
    if sub:
        j = s.find("chỉ tiêu", m.end())
        if 0 < j - m.end() < 400:
            k = s.rfind(">", m.end(), j) + 1
            s = s[:k] + sub + s[j+len("chỉ tiêu"):]
    print("OK:", label, "->", val)

# Soat 6 o giai doan: 04 06 08 05 03 14
stages = iter(["04","06","08","05","03","14"])
s = re.sub(r'\b\d{2}(?= HS\b)', lambda m: next(stages, m.group(0)), s)

# Canh bao ma con sot lai co the ghi de so lieu khi tai trang
left = [n for n,l in enumerate(s.splitlines(),1) if re.search(r'sb\.from\(|\.textContent\s*=|\.innerText\s*=|data-count|setInterval', l)]
if left: print("! Con ma co the ghi de so lieu o dong:", left, "-> gui toi doan do (khong gui khoa/mat khau)")

if s == o: print("Khong co thay doi.")
elif dry: print("[dry-run] khong ghi file.")
else:
    b = p.parent.parent.parent / "care_board_backup_html"; b.mkdir(exist_ok=True)
    shutil.copy2(p, b / (p.name + ".bak")); p.write_text(s, encoding="utf-8"); print("Da ghi. Ban sao luu:", b)
