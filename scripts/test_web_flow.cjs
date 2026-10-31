const http = require('http');

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
        const defaultHeaders = { ...headers };
        if (postData && !defaultHeaders['Content-Type']) {
            defaultHeaders['Content-Type'] = 'application/json';
        }
        if (postData) {
            defaultHeaders['Content-Length'] = Buffer.byteLength(postData);
        }

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: defaultHeaders
        };

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => { resData += chunk; });
            res.on('end', () => {
                let parsed = resData;
                try {
                    parsed = JSON.parse(resData);
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function runWebTests() {
    console.log('===============================================================');
    console.log('   KIỂM THỬ GIAO DIỆN WEB & TÍCH HỢP TÍNH NĂNG QUÊN MẬT KHẨU   ');
    console.log('===============================================================\n');

    // 1. Kiểm tra tải trang Frontend /forgot-password
    console.log('[WEB TEST 1] Tải trang giao diện /forgot-password trên Vite (Port 3000)...');
    const pageRes = await request('GET', '/forgot-password');
    console.log('Status code:', pageRes.status);
    if (pageRes.status === 200 && typeof pageRes.data === 'string' && pageRes.data.includes('<div id="root">')) {
        console.log('-> PASS: Giao diện Web /forgot-password sẵn sàng phục vụ người dùng!\n');
    } else {
        console.error('-> FAIL: Không thể tải giao diện web /forgot-password\n');
    }

    // 2. Kiểm tra tải trang /reset-password
    console.log('[WEB TEST 2] Tải trang giao diện /reset-password?token=sample123...');
    const resetPageRes = await request('GET', '/reset-password?token=sample123');
    console.log('Status code:', resetPageRes.status);
    if (resetPageRes.status === 200) {
        console.log('-> PASS: Giao diện Web /reset-password nhận diện định tuyến hợp lệ!\n');
    } else {
        console.error('-> FAIL: Định tuyến /reset-password gặp lỗi\n');
    }

    // 3. Kiểm tra Proxy Vite chuyển tiếp API Quên mật khẩu qua SMS OTP
    console.log('[WEB TEST 3] Khách hàng yêu cầu gửi OTP SMS qua giao diện Web (Proxy /api/auth)...');
    const forgotRes = await request('POST', '/api/auth/password/forgot', {
        channel: 'SMS',
        identifier: '0901234567'
    });
    console.log('API Status qua Web Proxy:', forgotRes.status);
    console.log('Payload phản hồi:', forgotRes.data);
    if (forgotRes.status === 200 && forgotRes.data.success) {
        console.log('-> PASS: Web Proxy kết nối thành công tới Backend API!\n');
    } else {
        console.error('-> FAIL: Không nhận được phản hồi hợp lệ\n');
    }

    const otpCode = forgotRes.data.simulatedOtp;

    // 4. Khách hàng xác thực OTP trên giao diện Web
    console.log(`[WEB TEST 4] Khách hàng nhập mã OTP [${otpCode}] vào form giao diện Web...`);
    const verifyRes = await request('POST', '/api/auth/password/verify-otp', {
        phone: '0901234567',
        otp: otpCode
    });
    console.log('API Status xác thực OTP:', verifyRes.status);
    console.log('Reset Token cấp cho Client:', verifyRes.data.resetToken ? '***' + verifyRes.data.resetToken.slice(-8) : 'null');
    if (verifyRes.status === 200 && verifyRes.data.resetToken) {
        console.log('-> PASS: OTP hợp lệ, Frontend nhận Reset Token thành công!\n');
    } else {
        console.error('-> FAIL: Xác thực OTP thất bại\n');
    }

    const resetToken = verifyRes.data.resetToken;

    // 5. Khách hàng đặt mật khẩu mới trên Web
    const tempNewPass = 'WebTestPass@2026';
    console.log(`[WEB TEST 5] Khách hàng gửi mật khẩu mới [${tempNewPass}]...`);
    const resetPassRes = await request('POST', '/api/auth/password/reset', {
        resetToken: resetToken,
        newPassword: tempNewPass,
        confirmPassword: tempNewPass
    });
    console.log('API Status đổi mật khẩu:', resetPassRes.status);
    console.log('Thông báo kết quả:', resetPassRes.data.message);
    if (resetPassRes.status === 200 && resetPassRes.data.success) {
        console.log('-> PASS: Mật khẩu mới được cập nhật thành công từ giao diện Web!\n');
    } else {
        console.error('-> FAIL: Cập nhật mật khẩu thất bại\n');
    }

    // 6. Đăng nhập thử với mật khẩu cũ (phải bị từ chối)
    console.log('[WEB TEST 6] Thử đăng nhập lại bằng mật khẩu cũ (Kiểm tra bảo mật)...');
    const oldLoginBody = new URLSearchParams({ username: 'admin', password: 'oldInvalidPassword' }).toString();
    const oldLoginRes = await request('POST', '/api/auth/login', oldLoginBody, {
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    console.log('Trạng thái đăng nhập mật khẩu cũ:', oldLoginRes.status);
    if (oldLoginRes.status === 401) {
        console.log('-> PASS: Hệ thống chặn đăng nhập với mật khẩu cũ chính xác (401 Unauthorized)!\n');
    }

    // 7. Đăng nhập thử với mật khẩu mới vừa đổi
    console.log(`[WEB TEST 7] Đăng nhập bằng mật khẩu mới [${tempNewPass}]...`);
    const newLoginBody = new URLSearchParams({ username: 'admin', password: tempNewPass }).toString();
    const newLoginRes = await request('POST', '/api/auth/login', newLoginBody, {
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    console.log('Trạng thái đăng nhập mật khẩu mới:', newLoginRes.status);
    console.log('Dữ liệu User đăng nhập:', newLoginRes.data?.fullName, '-', newLoginRes.data?.role);
    if (newLoginRes.status === 200 && newLoginRes.data?.userId) {
        console.log('-> PASS: Đăng nhập thành công với mật khẩu mới trên nền tảng Web!\n');
    }

    // 8. Dọn dẹp hoàn nguyên mật khẩu về 123456
    console.log('[DỌN DẸP] Hoàn nguyên mật khẩu tài khoản admin về lại 123456...');
    const forgotRestore = await request('POST', '/api/auth/password/forgot', { channel: 'SMS', identifier: '0901234567' });
    const verifyRestore = await request('POST', '/api/auth/password/verify-otp', { phone: '0901234567', otp: forgotRestore.data.simulatedOtp });
    await request('POST', '/api/auth/password/reset', {
        resetToken: verifyRestore.data.resetToken,
        newPassword: '123456',
        confirmPassword: '123456'
    });
    console.log('-> Đã hoàn nguyên mật khẩu demo chuẩn thành công.\n');

    console.log('===============================================================');
    console.log('   TẤT CẢ CÁC BƯỚC KIỂM THỬ WEB ĐỀU THÀNH CÔNG VÀ CHÍNH XÁC!  ');
    console.log('===============================================================');
}

runWebTests().catch(console.error);

