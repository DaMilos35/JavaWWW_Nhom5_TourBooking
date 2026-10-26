import docx
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/Nhom5_Detai49_BaoCaoCuoiKy.docx')
for idx in [206, 207, 284]:
    p = doc.paragraphs[idx]
    print(f"P{idx} [{p.style.name}]: text='{p.text[:40]}'")
    if p.runs:
        r = p.runs[0]
        print(f"  font: {r.font.name}, size: {r.font.size}, bold: {r.font.bold}, color: {r.font.color.rgb if r.font.color else None}")
