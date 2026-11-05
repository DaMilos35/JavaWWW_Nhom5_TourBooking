@echo off
chcp 65001 >nul
set "PATH=%~dp0.tools\mingit\cmd;%PATH%"
echo ======================================================================
echo 🚀 Đang đẩy code lên https://github.com/DaMilos35/JavaWWW_Nhom5_TourBooking
echo ======================================================================
git push origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ ĐÃ PUSH THÀNH CÔNG LÊN GITHUB!
) else (
    echo.
    echo ⚠️ NẾU GITHUB YÊU CẦU ĐĂNG NHẬP HOẶC TOKEN:
    echo Quý khách vui lòng tạo Personal Access Token trên GitHub:
    echo https://github.com/settings/tokens (chọn quyền repo)
    echo và chạy lệnh:
    echo git push https://[TOKEN]@github.com/DaMilos35/JavaWWW_Nhom5_TourBooking.git main
)
echo.
pause

