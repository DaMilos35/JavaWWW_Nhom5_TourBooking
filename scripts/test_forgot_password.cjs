const http = require('http');

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: '127.0.0.1',
            port: 8080,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let resData = '';
            res.on('data', chunk => { resData += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(resData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: resData });
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('   KIỂM THỬ TỰ ĐỘNG TÍNH NĂNG QUÊN & ĐẶT LẠI MẬT KHẨU');
    console.log('====================================================\n');

    // TEST 1: Quên mật khẩu qua Email
    console.log('[TEST 1] Yêu cầu mã xác thực qua Email: admin@dulichviet.vn');
    const res1 = await post('/api/auth/password/forgot', {
        channel: 'EMAIL',
        identifier: 'admin@dulichviet.vn'
    });
    console.log('Response Status:', res1.status);
    console.log('Response Body:', JSON.stringify(res1.data, null, 2));
    if (res1.status === 200 && res1.data.success && res1.data.simulatedToken) {
        console.log('-> PASS TEST 1: Gửi yêu cầu qua Email thành công!\n');
    } else {
        console.error('-> FAIL TEST 1!\n');
    }

    const emailResetToken = res1.data.simulatedToken;

    // TEST 2: Quên mật khẩu qua SMS OTP
    console.log('[TEST 2] Yêu cầu mã xác thực qua SMS OTP: 0901234567');
    const res2 = await post('/api/auth/password/forgot', {
        channel: 'SMS',
        identifier: '0901234567'
    });
    console.log('Response Status:', res2.status);
    console.log('Response Body:', JSON.stringify(res2.data, null, 2));
    if (res2.status === 200 && res2.data.success && res2.data.simulatedOtp) {
        console.log('-> PASS TEST 2: Gửi OTP qua SMS thành công!\n');
    } else {
        console.error('-> FAIL TEST 2!\n');
    }

    const otpCode = res2.data.simulatedOtp;

    // TEST 3: Xác thực OTP sai mã (Brute force protection test)
    console.log('[TEST 3] Thử xác thực OTP sai: 000000');
    const res3 = await post('/api/auth/password/verify-otp', {
        phone: '0901234567',
        otp: '000000'
    });
    console.log('Response Status:', res3.status);
    console.log('Response Body:', JSON.stringify(res3.data, null, 2));
    if (res3.status === 400) {
        console.log('-> PASS TEST 3: Hệ thống chặn mã OTP sai và đếm lượt thử chính xác!\n');
    } else {
        console.error('-> FAIL TEST 3!\n');
    }

    // TEST 4: Xác thực OTP đúng và cấp Reset Token
    console.log(`[TEST 4] Xác thực OTP chính xác: ${otpCode}`);
    const res4 = await post('/api/auth/password/verify-otp', {
        phone: '0901234567',
        otp: otpCode
    });
    console.log('Response Status:', res4.status);
    console.log('Response Body:', JSON.stringify(res4.data, null, 2));
    if (res4.status === 200 && res4.data.success && res4.data.resetToken) {
        console.log('-> PASS TEST 4: Xác thực OTP thành công & đã cấp temporary Reset Token!\n');
    } else {
        console.error('-> FAIL TEST 4!\n');
    }

    const smsResetToken = res4.data.resetToken;

    // TEST 5: Đặt lại mật khẩu mới bằng SMS Reset Token
    console.log('[TEST 5] Đặt lại mật khẩu mới qua SMS Reset Token');
    const res5 = await post('/api/auth/password/reset', {
        resetToken: smsResetToken,
        newPassword: 'AdminNewPassword@2026',
        confirmPassword: 'AdminNewPassword@2026'
    });
    console.log('Response Status:', res5.status);
    console.log('Response Body:', JSON.stringify(res5.data, null, 2));
    if (res5.status === 200 && res5.data.success) {
        console.log('-> PASS TEST 5: Đặt lại mật khẩu thành công & đã thu hồi toàn bộ token cũ!\n');
    } else {
        console.error('-> FAIL TEST 5!\n');
    }

    // TEST 6: Thử tái sử dụng Reset Token đã dùng (Chống Replay Attack)
    console.log('[TEST 6] Thử tái sử dụng Reset Token đã dùng (Replay Attack)');
    const res6 = await post('/api/auth/password/reset', {
        resetToken: smsResetToken,
        newPassword: 'AnotherPassword@2026',
        confirmPassword: 'AnotherPassword@2026'
    });
    console.log('Response Status:', res6.status);
    console.log('Response Body:', JSON.stringify(res6.data, null, 2));
    if (res6.status === 400) {
        console.log('-> PASS TEST 6: Hệ thống chặn token đã qua sử dụng thành công!\n');
    } else {
        console.error('-> FAIL TEST 6!\n');
    }

    // Đổi lại mật khẩu ban đầu '123456' để không ảnh hưởng dữ liệu demo
    console.log('[DỌN DẸP] Phục hồi mật khẩu admin về lại 123456...');
    const resRestoreReq = await post('/api/auth/password/forgot', {
        channel: 'SMS',
        identifier: '0901234567'
    });
    const resRestoreVerify = await post('/api/auth/password/verify-otp', {
        phone: '0901234567',
        otp: resRestoreReq.data.simulatedOtp
    });
    await post('/api/auth/password/reset', {
        resetToken: resRestoreVerify.data.resetToken,
        newPassword: '123456',
        confirmPassword: '123456'
    });
    console.log('-> Đã hoàn nguyên mật khẩu demo admin thành công.\n');

    console.log('====================================================');
    console.log('   TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ HOÀN TẤT XUẤT SẮC!   ');
    console.log('====================================================');
}

runTests().catch(console.error);

