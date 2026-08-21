with open('src/pages/LoginPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"Dang nhap thanh cong!"', "'Đăng nhập thành công!'")
content = content.replace('"Sai tai khoan hoac mat khau"', "'Tài khoản hoặc mật khẩu không chính xác.'")

with open('src/pages/LoginPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
