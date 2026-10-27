@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

set BASE=http://localhost:8080/api/corporate
set PASS=0
set FAIL=0

echo.
echo ==================================================================
echo   TEST B2B CORPORATE FEATURE
echo ==================================================================
echo.

:: TEST 1: GET all companies
echo [TEST 1] GET companies
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Danh sach cong ty - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 2: GET company 1
echo [TEST 2] GET company/1 (FPT)
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies/1 > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Chi tiet cong ty FPT - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 3: GET credit limit
echo [TEST 3] GET credit/company/1
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies/1/credit > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Credit limit FPT - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 4: GET policies
echo [TEST 4] GET policies/company/1
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies/1/policies > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Travel policies - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 5: GET approvals PENDING
echo [TEST 5] GET approvals company/1 (PENDING)
curl -s -o nul -w "HTTP:%%{http_code}" "%BASE%/companies/1/approvals?status=PENDING" > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Approval requests - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 6: GET bookings
echo [TEST 6] GET bookings/company/1
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies/1/bookings > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Bookings FPT - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 7: 404 not found
echo [TEST 7] GET company/9999 (phai 404)
curl -s -o nul -w "HTTP:%%{http_code}" %BASE%/companies/9999 > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:404" (
    echo   [PASS] Company khong ton tai - 404 dung
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 404, got !CODE!
    set /a FAIL+=1
)

:: TEST 8: POST create booking (tour 38 = Nhat Ban 29.9tr, policy max 8tr -> OVER POLICY)
echo [TEST 8] POST booking (over-policy, tour Nhat Ban 29.9tr vs policy 8tr)
curl -s -w "HTTP:%%{http_code}" -X POST %BASE%/companies/1/bookings ^
  -H "Content-Type: application/json" ^
  -d "{\"bookerCorpUserId\":1,\"travelerCorpUserId\":4,\"tourId\":38,\"quantity\":1,\"contactName\":\"Nguyen Van Test\",\"contactPhone\":\"0901234567\",\"contactEmail\":\"test@fpt.com.vn\",\"discountPercent\":10}" > temp_resp.txt 2>&1
set /p FULL=<temp_resp.txt
del temp_resp.txt
echo !FULL! | find "HTTP:200" >nul
if !errorlevel!==0 (
    echo   [PASS] Booking B2B tao thanh cong - 200 OK
    echo !FULL! | find "PENDING_APPROVAL" >nul
    if !errorlevel!==0 (
        echo   [INFO] Trang thai: PENDING_APPROVAL (viet han muc dung)
    )
    set /a PASS+=1
) else (
    echo   [FAIL] !FULL!
    set /a FAIL+=1
)

:: TEST 9: PATCH credit limit
echo [TEST 9] PATCH credit limit cong ty 2 (tang len 1.5ty)
curl -s -o nul -w "HTTP:%%{http_code}" -X PATCH %BASE%/companies/2/credit ^
  -H "Content-Type: application/json" ^
  -d "{\"newCreditLimit\":1500000000}" > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Cap nhat credit limit - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 10: POST create new company
echo [TEST 10] POST tao cong ty moi
curl -s -o nul -w "HTTP:%%{http_code}" -X POST %BASE%/companies ^
  -H "Content-Type: application/json" ^
  -d "{\"companyName\":\"Cong Ty TNHH Test Auto\",\"taxCode\":\"1122334455\",\"emailDomain\":\"autotest.vn\",\"billingEmail\":\"finance@autotest.vn\",\"industry\":\"Cong nghe\",\"companySize\":\"SME\",\"paymentMethod\":\"PAY_AS_YOU_GO\",\"vatName\":\"Cong Ty Test\",\"vatAddress\":\"Ha Noi\"}" > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Tao cong ty moi - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 11: POST create policy
echo [TEST 11] POST tao travel policy moi cho cong ty 3
curl -s -o nul -w "HTTP:%%{http_code}" -X POST %BASE%/companies/3/policies ^
  -H "Content-Type: application/json" ^
  -d "{\"policyName\":\"Shopee Standard\",\"description\":\"Policy chuan Shopee\",\"isDefault\":true,\"maxAmountPerTrip\":6000000,\"advanceBookingDaysMin\":5,\"requireApprovalAbove\":5000000,\"createdBy\":3}" > temp_resp.txt
set /p CODE=<temp_resp.txt
del temp_resp.txt
if "!CODE!"=="HTTP:200" (
    echo   [PASS] Tao travel policy - 200 OK
    set /a PASS+=1
) else (
    echo   [FAIL] Expected 200, got !CODE!
    set /a FAIL+=1
)

:: TEST 12: Verify credit limit chi tiet
echo [TEST 12] GET credit cong ty 2 (sau khi nang len 1.5ty)
curl -s -w "HTTP:%%{http_code}" %BASE%/companies/2/credit > temp_resp.txt 2>&1
set /p FULL=<temp_resp.txt
del temp_resp.txt
echo !FULL! | find "1500000000" >nul
if !errorlevel!==0 (
    echo   [PASS] Credit limit da cap nhat thanh 1.5 ty dung
    set /a PASS+=1
) else (
    echo   [FAIL] !FULL!
    set /a FAIL+=1
)

echo.
echo ==================================================================
echo   KET QUA TONG HOP:  !PASS! PASSED  /  !FAIL! FAILED
if !FAIL!==0 (
    echo   TRANG THAI: TAT CA TEST PASS - B2B Feature hoat dong hoan hao!
) else (
    echo   TRANG THAI: CO !FAIL! TEST THAT BAI
)
echo ==================================================================
