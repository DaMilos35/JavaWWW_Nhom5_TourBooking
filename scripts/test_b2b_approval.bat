@echo off
chcp 65001 > nul
echo.
echo === TEST APPROVAL WORKFLOW B2B ===
echo.

echo [1] Phe duyet Approval ID=1 (Manager dong y)
curl -s -X POST http://localhost:8080/api/corporate/approvals/1/approve ^
  -H "Content-Type: application/json" ^
  -d "{\"approverCorpUserId\":5,\"note\":\"Dong y chap thuan chuyen cong tac Q4\"}"
echo.
echo.

echo [2] Kiem tra booking sau khi phe duyet
curl -s http://localhost:8080/api/corporate/companies/1/bookings
echo.
echo.

echo [3] Kiem tra credit limit cong ty 1 (phai tang them 26.9tr)
curl -s http://localhost:8080/api/corporate/companies/1/credit
echo.
echo.

echo [4] Tao booking moi cho cong ty 3 (Shopee) - trong han muc (tour id 1)
curl -s -X POST http://localhost:8080/api/corporate/companies/3/bookings ^
  -H "Content-Type: application/json" ^
  -d "{\"bookerCorpUserId\":3,\"travelerCorpUserId\":3,\"tourId\":1,\"quantity\":1,\"contactName\":\"HR Shopee\",\"contactPhone\":\"0909123456\",\"contactEmail\":\"hr@shopee.vn\"}"
echo.
echo.

echo [5] Xem danh sach tat ca cong ty hien tai
curl -s http://localhost:8080/api/corporate/companies
echo.
echo === XONG ===
