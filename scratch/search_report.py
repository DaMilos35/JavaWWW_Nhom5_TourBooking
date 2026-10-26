import docx

doc = docx.Document('docs/Nhom5_Detai49_BaoCaoCuoiKy.docx')
with open('scratch/report_sections.txt', 'w', encoding='utf-8') as f:
    for i, p in enumerate(doc.paragraphs):
        t = p.text.strip()
        if t.startswith('CHƯƠNG') or t.startswith('3.') or t.startswith('4.') or t.startswith('5.'):
            f.write(f"Line {i}: {t}\n")
print("Wrote sections")
