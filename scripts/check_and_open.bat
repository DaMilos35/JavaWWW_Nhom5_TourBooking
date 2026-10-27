@echo off
chcp 65001 > nul
echo.
echo ============================================================
echo   KIEM TRA TOAN BO HE THONG - TourBooking B2B
echo ============================================================
echo.

set PASS=0
set FAIL=0

:: Kiem tra backend
echo [1/4] Backend 8080...
curl -s -o nul -w "%%{http_code}" http://localhost:8080/api/tours > tmp.txt
set /p CODE=<tmp.txt & del tmp.txt
if "%CODE%"=="200" (
    echo   [OK] Backend dang chay - port 8080 hoat dong
    set /a PASS+=1
) else (
    echo   [LOI] Backend khong phan hoi - ma %CODE%
    set /a FAIL+=1
)

:: Kiem tra frontend
echo [2/4] Frontend 3000...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > tmp.txt
set /p CODE=<tmp.txt & del tmp.txt
if "%CODE%"=="200" (
    echo   [OK] Frontend dang chay - port 3000 hoat dong
    set /a PASS+=1
) else (
    echo   [LOI] Frontend khong phan hoi - ma %CODE%
    set /a FAIL+=1
)

:: Kiem tra B2B API
echo [3/4] B2B API - danh sach cong ty...
curl -s http://localhost:8080/api/corporate/companies > tmp_b2b.txt
findstr /c:"companyId" tmp_b2b.txt >nul
if %errorlevel%==0 (
    echo   [OK] B2B API hoat dong - co du lieu cong ty
    set /a PASS+=1
) else (
    echo   [LOI] B2B API khong co du lieu
    set /a FAIL+=1
)
del tmp_b2b.txt

:: Kiem tra auth login
echo [4/4] Auth login (admin)...
curl -s -o nul -w "%%{http_code}" -X POST http://localhost:8080/api/auth/login ^
  -F "username=admin" -F "password=123456" > tmp.txt
set /p CODE=<tmp.txt & del tmp.txt
if "%CODE%"=="200" (
    echo   [OK] Dang nhap admin thanh cong
    set /a PASS+=1
) else (
    echo   [LOI] Dang nhap that bai - ma %CODE%
    set /a FAIL+=1
)

echo.
echo ============================================================
if %FAIL%==0 (
    echo   TONG KET: %PASS%/%PASS% PASS - HE THONG HOAT DONG HOAN HOA!
    echo.
    echo   MO TRINH DUYET...
    start "" "http://localhost:3000/admin/b2b"
) else (
    echo   TONG KET: %PASS% PASS / %FAIL% FAIL
)
echo ============================================================
