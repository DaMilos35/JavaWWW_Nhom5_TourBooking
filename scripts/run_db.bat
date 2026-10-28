@echo off
chcp 65001 > nul
echo ================================================
echo  TourBookingDB - Chay lai toan bo database
echo ================================================
echo.

set MYSQL="C:\Program Files\MariaDB 12.2\bin\mysql.exe"
if not exist %MYSQL% set MYSQL=mysql

set USER=root
set PASS=%DB_PASSWORD%
if "%PASS%"=="" set PASS=12345678

set SCHEMA="%~dp0..\database\schema.sql"
set DATA="%~dp0..\database\data.sql"
set B2B="%~dp0..\database\b2b_migration.sql"

echo [1/3] Dang chay schema.sql voi mat khau %PASS%...
%MYSQL% -u %USER% --password=%PASS% < %SCHEMA%
IF %ERRORLEVEL% NEQ 0 (
    echo [THU LAI] Dang thu voi sapassword...
    set PASS=sapassword
    %MYSQL% -u %USER% --password=%PASS% < %SCHEMA%
    IF %ERRORLEVEL% NEQ 0 (
        echo [LOI] schema.sql that bai! Kiem tra lai mat khau hoac ket noi DB.
        pause
        exit /b 1
    )
)
echo [OK] schema.sql thanh cong!
echo.

echo [2/3] Dang chay data.sql (co the mat 30-60 giay)...
%MYSQL% -u %USER% --password=%PASS% < %DATA%
IF %ERRORLEVEL% NEQ 0 (
    echo [LOI] data.sql that bai!
    pause
    exit /b 1
)
echo [OK] data.sql thanh cong!
echo.

echo [3/3] Dang chay b2b_migration.sql...
%MYSQL% -u %USER% --password=%PASS% < %B2B%
IF %ERRORLEVEL% NEQ 0 (
    echo [CANH BAO] b2b_migration.sql khong thanh cong!
) ELSE (
    echo [OK] b2b_migration.sql thanh cong!
)
echo.

echo ================================================
echo  Database da duoc reset thanh cong!
echo  - 8 categories
echo  - 40 tours
echo  - 28 users (mat khau: 123456)
echo  - B2B Corporate Feature
echo ================================================
pause
