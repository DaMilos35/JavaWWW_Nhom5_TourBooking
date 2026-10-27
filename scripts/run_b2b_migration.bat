@echo off
chcp 65001 > nul
echo Dang chay B2B migration...
"C:\Program Files\MariaDB 12.2\bin\mysql.exe" -u root --password=sapassword < "E:\WWW\JavaWWW_Nhom5_TourBooking\database\b2b_migration.sql"
IF %ERRORLEVEL% EQU 0 (
    echo [OK] B2B migration thanh cong!
) ELSE (
    echo [LOI] Migration that bai!
)
