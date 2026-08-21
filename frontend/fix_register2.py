with open("src/pages/RegisterPage.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = re.sub(r'width: \$\(\(passwordStrength/4\)\*100\)%', 'width: `${(passwordStrength/4)*100}%`', content)
content = content.replace("Ho v  T'en", "Họ và Tên")
content = content.replace("S'o dien tho i", "Số điện thoại")
content = content.replace("M t kh u", "Mật khẩu")
content = content.replace("X'ac nh n m t kh u", "Xác nhận mật khẩu")
content = content.replace("VD: Nguyen V n A", "VD: Nguyễn Văn A")

with open("src/pages/RegisterPage.jsx", "w", encoding="utf-8") as f:
    f.write(content)
