import docx

doc = docx.Document('docs/Nhom5_Detai49_BaoCaoCuoiKy.docx')
for s in doc.styles:
    if s.type == docx.enum.style.WD_STYLE_TYPE.PARAGRAPH:
        if 'Heading' in s.name or 'Normal' in s.name:
            print(f"Style: {s.name}")
