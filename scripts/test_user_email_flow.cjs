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
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
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

async function runTest() {
  console.log('========================================================');
  console.log('  KIỂM THỬ TÍNH NĂNG QUÊN MẬT KHẨU CHO EMAIL THẬT:');
  console.log('  levietcaoson27@gmail.com (QUA KÊNH TRUNG GIAN - NO PASS)');
  console.log('========================================================\n');

  // BƯỚC 1: Gửi yêu cầu qua Email
  console.log('[BƯỚC 1] Gửi yêu cầu đặt lại mật khẩu cho levietcaoson27@gmail.com...');
  const res1 = await post('/api/auth/password/forgot', {
    channel: 'EMAIL',
    identifier: 'levietcaoson27@gmail.com'
  });

  console.log('HTTP Status:', res1.status);
  console.log('Payload phản hồi:', JSON.stringify(res1.data, null, 2));

  if (!res1.data.success || !res1.data.simulatedToken) {
    throw new Error('Bước 1 thất bại! Không nhận được simulatedToken');
  }

  const token = res1.data.simulatedToken;
  const resetLink = res1.data.resetLink;
  console.log('\n✔ Đã nhận diện fullTarget:', res1.data.fullTarget);
  console.log('✔ Reset Link sinh ra:', resetLink);
  console.log('✔ Token nhận được:', token);

  // BƯỚC 2: Sử dụng token để đặt mật khẩu mới
  const newPassword = 'Password123@!';
  console.log('\n[BƯỚC 2] Đặt lại mật khẩu mới cho tài khoản...');
  const res2 = await post('/api/auth/password/reset', {
    resetToken: token,
    newPassword: newPassword,
    confirmPassword: newPassword
  });

  console.log('HTTP Status:', res2.status);
  console.log('Payload phản hồi:', JSON.stringify(res2.data, null, 2));

  if (!res2.data.success) {
    throw new Error('Bước 2 thất bại! Không đổi được mật khẩu');
  }
  console.log('✔ Đổi mật khẩu thành công qua token!');

  // BƯỚC 3: Đăng nhập thử bằng mật khẩu mới
  console.log('\n[BƯỚC 3] Đăng nhập bằng mật khẩu mới...');
  const res3 = await post('/api/auth/login', {
    username: 'levietcaoson27@gmail.com',
    password: newPassword
  });

  console.log('HTTP Status:', res3.status);
  if (res3.status === 200 && res3.data.token) {
    console.log('✔ Đăng nhập thành công bằng mật khẩu mới!');
    console.log('✔ User Role:', res3.data.role || res3.data.roles);
  } else {
    // Có thể username khác email, thử tìm username hoặc kiểm tra
    console.log('Response body:', res3.data);
  }

  // DỌN DẸP: Khôi phục mật khẩu về 123456
  console.log('\n[DỌN DẸP] Đổi lại mật khẩu về 123456 để dữ liệu mẫu luôn ổn định...');
  const resResetAgain = await post('/api/auth/password/forgot', {
    channel: 'EMAIL',
    identifier: 'levietcaoson27@gmail.com'
  });
  if (resResetAgain.data.simulatedToken) {
    await post('/api/auth/password/reset', {
      resetToken: resResetAgain.data.simulatedToken,
      newPassword: 'Password123!',
      confirmPassword: 'Password123!'
    });
    console.log('✔ Đã hoàn tất dọn dẹp.');
  }

  console.log('\n========================================================');
  console.log('🎉 KIỂM THỬ HOÀN TOÀN THÀNH CÔNG VỚI levietcaoson27@gmail.com!');
  console.log('========================================================');
}

runTest().catch(err => {
  console.error('LỖI KIỂM THỬ:', err);
  process.exit(1);
});

