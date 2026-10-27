@echo off
chcp 65001 > nul
set BASE=http://localhost:8080
set CURL=curl -s --max-time 10
set PASS=0
set FAIL=0

echo.
echo ==================================================================
echo   TEST DANG NHAP - TourBooking API
echo   URL: %BASE%/api/auth/login
echo ==================================================================
echo.

:: ---- TEST 1: admin / 123456 ----
echo [TEST 1] admin / 123456 (ADMIN)
set RESP=
for /f "delims=" %%i in ('%CURL% -X POST %BASE%/api/auth/login -d "username=admin&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "ADMIN" >nul
if %errorlevel%==0 (
    echo   [PASS] Dang nhap thanh cong - Role: ADMIN
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 2: customer / 123456 ----
echo [TEST 2] customer / 123456 (CUSTOMER)
for /f "delims=" %%i in ('%CURL% -X POST %BASE%/api/auth/login -d "username=customer&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "CUSTOMER" >nul
if %errorlevel%==0 (
    echo   [PASS] Dang nhap thanh cong - Role: CUSTOMER
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 3: vietravel / 123456 ----
echo [TEST 3] vietravel / 123456 (PROVIDER)
for /f "delims=" %%i in ('%CURL% -X POST %BASE%/api/auth/login -d "username=vietravel&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "PROVIDER" >nul
if %errorlevel%==0 (
    echo   [PASS] Dang nhap thanh cong - Role: PROVIDER
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 4: saigontourist / 123456 ----
echo [TEST 4] saigontourist / 123456 (PROVIDER)
for /f "delims=" %%i in ('%CURL% -X POST %BASE%/api/auth/login -d "username=saigontourist&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "PROVIDER" >nul
if %errorlevel%==0 (
    echo   [PASS] Dang nhap thanh cong - Role: PROVIDER
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 5: nguyenvanan / 123456 ----
echo [TEST 5] nguyenvanan / 123456 (CUSTOMER)
for /f "delims=" %%i in ('%CURL% -X POST %BASE%/api/auth/login -d "username=nguyenvanan&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "CUSTOMER" >nul
if %errorlevel%==0 (
    echo   [PASS] Dang nhap thanh cong - Role: CUSTOMER
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 6: admin / wrongpass (PHAI THAT BAI) ----
echo [TEST 6] admin / wrongpass (phai bi tu choi)
for /f "delims=" %%i in ('%CURL% -w "HTTP_CODE:%%{http_code}" -X POST %BASE%/api/auth/login -d "username=admin&password=wrongpass" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "HTTP_CODE:401" >nul
if %errorlevel%==0 (
    echo   [PASS] Bi tu choi dung - HTTP 401 Unauthorized
    set /a PASS+=1
) else (
    echo   [FAIL] Ky vong HTTP 401 nhung nhan: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 7: username khong ton tai ----
echo [TEST 7] userkhongtontai / 123456 (user khong ton tai)
for /f "delims=" %%i in ('%CURL% -w "HTTP_CODE:%%{http_code}" -X POST %BASE%/api/auth/login -d "username=userkhongtontai&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
echo %RESP% | find "HTTP_CODE:401" >nul
if %errorlevel%==0 (
    echo   [PASS] Bi tu choi dung - HTTP 401
    set /a PASS+=1
) else (
    echo   [FAIL] Ky vong HTTP 401 nhung nhan: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 8: GET /api/auth/me chua dang nhap ----
echo [TEST 8] GET /api/auth/me chua dang nhap (phai 401)
for /f "delims=" %%i in ('%CURL% -w "HTTP_CODE:%%{http_code}" %BASE%/api/auth/me') do set RESP=%%i
echo %RESP% | find "HTTP_CODE:401" >nul
if %errorlevel%==0 (
    echo   [PASS] Phan hoi dung - HTTP 401 chua dang nhap
    set /a PASS+=1
) else (
    echo   [FAIL] Ky vong HTTP 401 nhung nhan: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 9: GET tours public (khong can dang nhap) ----
echo [TEST 9] GET /api/tours (public, khong can dang nhap)
for /f "delims=" %%i in ('%CURL% -w "HTTP_CODE:%%{http_code}" %BASE%/api/tours?page=0^&size=3') do set RESP=%%i
echo %RESP% | find "HTTP_CODE:200" >nul
if %errorlevel%==0 (
    echo   [PASS] Tours public - HTTP 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Ky vong HTTP 200 nhung nhan: %RESP%
    set /a FAIL+=1
)

:: ---- TEST 10: Dang nhap admin roi get /me ----
echo [TEST 10] admin dang nhap roi GET /api/auth/me voi session
for /f "delims=" %%i in ('%CURL% -c cookie.txt -X POST %BASE%/api/auth/login -d "username=admin&password=123456" -H "Content-Type: application/x-www-form-urlencoded"') do set RESP=%%i
for /f "delims=" %%i in ('%CURL% -b cookie.txt %BASE%/api/auth/me') do set ME=%%i
echo %ME% | find "ADMIN" >nul
if %errorlevel%==0 (
    echo   [PASS] Session hop le - /me tra ve thong tin admin
    set /a PASS+=1
) else (
    echo   [FAIL] Phan hoi /me: %ME%
    set /a FAIL+=1
)
del cookie.txt 2>nul

echo.
echo ==================================================================
echo   KET QUA TONG HOP:  %PASS% PASSED  /  %FAIL% FAILED
if %FAIL%==0 (
    echo   TRANG THAI: TAT CA TEST PASS - He thong hoat dong tot!
) else (
    echo   TRANG THAI: CO %FAIL% TEST THAT BAI - Can kiem tra lai!
)
echo ==================================================================
