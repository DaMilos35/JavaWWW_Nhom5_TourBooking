with open('src/api/axiosConfig.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\Bearer \', r"'Bearer '")
content = content.replace(r'\Bearer \', r"'Bearer '")

with open('src/api/axiosConfig.js', 'w', encoding='utf-8') as f:
    f.write(content)
