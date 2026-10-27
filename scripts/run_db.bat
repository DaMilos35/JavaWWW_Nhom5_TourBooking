@echo off
chcp 65001 > nul
echo ================================================
echo  TourBookingDB - Chay lai toan bo database
echo ================================================
echo.

set MYSQL="C:\Program Files\MariaDB 12.2\bin\mysql.exe"
set USER=root
set PASS=sapassword
set SCHEMA=E:\WWW\JavaWWW_Nhom5_TourBooking\database\schema.sql
set DATA=E:\WWW\JavaWWW_Nhom5_TourBooking\database\data.sql

echo [1/2] Dang chay schema.sql...
%MYSQL% -u %USER% --password=%PASS% < %SCHEMA%
IF %ERRORLEVEL% NEQ 0 (
    echo [LOI] schema.sql that bai! Kiem tra lai mat khau hoac ket noi DB.
    pause
    exit /b 1
)
echo [OK] schema.sql thanh cong!
echo.

echo [2/2] Dang chay data.sql (co the mat 30-60 giay)...
%MYSQL% -u %USER% --password=%PASS% < %DATA%
IF %ERRORLEVEL% NEQ 0 (
    echo [LOI] data.sql that bai!
    pause
    exit /b 1
)
echo [OK] data.sql thanh cong!
echo.
echo ================================================
echo  Database da duoc reset thanh cong!
echo  - 8 categories
echo  - 40 tours
echo  - 28 users (mat khau: 123456)
echo  - 130+ orders
echo ================================================
pause
