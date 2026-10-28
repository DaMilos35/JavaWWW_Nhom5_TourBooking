@echo off
chcp 65001 > nul
echo Dang chay B2B migration...

set MYSQL="C:\Program Files\MariaDB 12.2\bin\mysql.exe"
if not exist %MYSQL% set MYSQL=mysql

set PASS=%DB_PASSWORD%
if "%PASS%"=="" set PASS=12345678

%MYSQL% -u root --password=%PASS% < "%~dp0..\database\b2b_migration.sql"
IF %ERRORLEVEL% EQU 0 (
    echo [OK] B2B migration thanh cong!
) ELSE (
    echo [LOI] Migration that bai voi mat khau %PASS%, thu lai voi sapassword...
    %MYSQL% -u root --password=sapassword < "%~dp0..\database\b2b_migration.sql"
    IF %ERRORLEVEL% EQU 0 (
        echo [OK] B2B migration thanh cong voi sapassword!
    ) ELSE (
        echo [LOI] Migration that bai hoan toan!
    )
)
