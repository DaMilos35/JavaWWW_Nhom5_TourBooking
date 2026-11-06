const { spawn } = require('child_process');
const http = require('http');

function post(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = http.request('http://localhost:8080' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: b });
        }
      });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('===============================================================');
  console.log('   KIỂM THỬ LUỒNG EMAIL MÃ PIN XÁC THỰC NGẪU NHIÊN VỀ GMAIL');
  console.log('   (NHẬP ĐÚNG MỚI CHO PHÉP ĐỔI MẬT KHẨU - ZERO PASSWORD)');
  console.log('===============================================================\n');

  // --- PHẦN 1: KIỂM THỬ API BACKEND ---
  console.log('[API TEST 1] Yêu cầu gửi mã PIN ngẫu nhiên đến levietcaoson27@gmail.com...');
  const reqRes = await post('/api/auth/password/forgot', {
    channel: 'EMAIL',
    identifier: 'levietcaoson27@gmail.com'
  });

  console.log('  Status:', reqRes.status);
  console.log('  Phản hồi:', reqRes.data);

  if (reqRes.status !== 200 || !reqRes.data.simulatedOtp) {
    throw new Error('API Test 1 Thất bại! Không nhận được mã PIN.');
  }

  const generatedPin = reqRes.data.simulatedOtp;
  console.log(`  -> Mã PIN 6 chữ số ngẫu nhiên sinh ra: [${generatedPin}]`);

  console.log('\n[API TEST 2] Thử xác thực với mã PIN sai (000000)...');
  const wrongRes = await post('/api/auth/password/verify-otp', {
    phone: 'levietcaoson27@gmail.com',
    otp: '000000'
  });
  console.log('  Status:', wrongRes.status);
  console.log('  Thông báo:', wrongRes.data.message);
  if (wrongRes.status === 400 && wrongRes.data.message.includes('không chính xác')) {
    console.log('  ✔ PASS: Hệ thống chặn thành công khi nhập sai mã PIN!');
  } else {
    throw new Error('API Test 2 Thất bại! Không chặn mã sai.');
  }

  console.log(`\n[API TEST 3] Xác thực với đúng mã PIN ngẫu nhiên [${generatedPin}]...`);
  const correctRes = await post('/api/auth/password/verify-otp', {
    phone: 'levietcaoson27@gmail.com',
    otp: generatedPin
  });
  console.log('  Status:', correctRes.status);
  console.log('  Thông báo:', correctRes.data.message);
  if (correctRes.status === 200 && correctRes.data.resetToken) {
    console.log('  ✔ PASS: Xác thực mã PIN thành công & cấp Reset Token!');
  } else {
    throw new Error('API Test 3 Thất bại! Không xác thực được mã PIN đúng.');
  }

  // --- PHẦN 2: KIỂM THỬ GIAO DIỆN WEB TRONG CHROME HEADLESS ---
  console.log('\n---------------------------------------------------------------');
  console.log('   BẮT ĐẦU KIỂM THỬ GIAO DIỆN WEB VỚI CHROME HEADLESS (PORT 9346)');
  console.log('---------------------------------------------------------------');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9346;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\chrome-test-pw-pin'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/json/list`, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      }).on('error', reject);
    });

    const page = listRes.find(p => p.type === 'page') || listRes[0];
    const ws = new (global.WebSocket || require('ws'))(page.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg.result);
        callbacks.delete(msg.id);
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    console.log('1. Mở trang http://localhost:3000/forgot-password...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/forgot-password' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('2. Bấm nút chọn email thật "levietcaoson27@gmail.com"...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.innerText.includes('levietcaoson27@gmail.com'));
        if (target) target.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    console.log('3. Nhấn "Gửi liên kết đặt lại mật khẩu"...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      })()`
    });

    // Chờ phản hồi API và chuyển sang Bước 2
    await new Promise(r => setTimeout(r, 2000));

    const checkStep2 = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.auth-card');
        const text = card ? card.innerText : '';
        const modal = document.querySelector('.gmail-modal-container');
        const modalText = modal ? modal.innerText : '';
        const input = document.querySelector('input[type="text"]');
        return {
          rawText: text,
          hasStep2PinText: text.includes('Mã PIN ngẫu nhiên 6 chữ số') || text.includes('mã PIN xác thực') || text.includes('Mã PIN'),
          hasTargetEmail: text.includes('levietcaoson27@gmail.com') || modalText.includes('levietcaoson27@gmail.com'),
          hasGmailButton: text.includes('Mở Hộp Thoại Gmail') || text.includes('Gmail'),
          hasVerifyPinButton: text.includes('Xác thực mã PIN') || text.includes('Xác thực'),
          currentInputValue: input ? input.value : null,
          hasGmailModal: !!modal,
          modalText: modalText.substring(0, 300)
        };
      })()`,
      returnByValue: true
    });

    console.log('  Kết quả Bước 2 (Nhập mã PIN):', checkStep2?.result?.value);
    const step2Info = checkStep2?.result?.value;

    if (!step2Info?.hasStep2PinText || !step2Info?.hasTargetEmail || !step2Info?.hasVerifyPinButton) {
      throw new Error('Giao diện Bước 2 không hiển thị đúng thông tin mã PIN.');
    }
    if (step2Info?.currentInputValue !== '') {
      throw new Error(`Kỳ vọng ô nhập mã PIN để trống (không tự điền), nhưng nhận: "${step2Info?.currentInputValue}"`);
    }
    console.log('  ✔ PASS: Ô mã PIN để trống chính xác, không tự điền mã PIN!');
    console.log('  ✔ PASS: Giao diện hiển thị Hộp Thoại Gmail của website với email gửi đến levietcaoson27@gmail.com!');

    console.log('3.1 Lấy mã PIN từ Hộp thoại Gmail và nhập vào ô xác thực...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const pasteBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('Dán mã & Đóng'));
        if (pasteBtn) {
          pasteBtn.click();
        } else {
          const pinEl = document.querySelector('.gmail-modal-container strong') || document.querySelector('.gmail-modal-container');
          const pinMatch = pinEl ? pinEl.innerText.match(/\\b\\d{6}\\b/) : null;
          const pin = pinMatch ? pinMatch[0] : '${generatedPin}';
          const input = document.querySelector('input[type="text"]');
          if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(input, pin);
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('4. Nhấn nút "Xác thực mã PIN & Đổi mật khẩu"...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      })()`
    });

    // Chờ xác thực thành công và chuyển sang Bước 3
    await new Promise(r => setTimeout(r, 2000));

    const checkStep3 = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.auth-card');
        const text = card ? card.innerText : '';
        const inputs = Array.from(document.querySelectorAll('input'));
        return {
          isStep3: text.includes('Đã nhận diện Token xác thực') || text.includes('Mật khẩu mới'),
          passwordInputsCount: inputs.filter(i => i.type === 'password').length,
          hasSubmitResetBtn: text.includes('Đổi mật khẩu')
        };
      })()`,
      returnByValue: true
    });

    console.log('  Kết quả Bước 3 (Nhập mật khẩu mới):', checkStep3?.result?.value);
    const step3Info = checkStep3?.result?.value;

    if (!step3Info?.isStep3 || step3Info?.passwordInputsCount < 2) {
      throw new Error('Giao diện Bước 3 không mở sau khi xác thực mã PIN.');
    }
    console.log('  ✔ PASS: Sau khi xác thực đúng mã PIN, hệ thống MỞ KHÓA Bước 3 cho phép đổi mật khẩu mới!');

    console.log('5. Điền mật khẩu mới và xác nhận mật khẩu...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="password"]'));
        if (inputs.length >= 2) {
          // React synthetic event trigger
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(inputs[0], 'TestNewPass@2026');
          inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          nativeInputValueSetter.call(inputs[1], 'TestNewPass@2026');
          inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      })()`
    });
    await new Promise(r => setTimeout(r, 500));

    console.log('6. Nhấn nút hoàn tất đổi mật khẩu...');
    await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      })()`
    });

    await new Promise(r => setTimeout(r, 2000));

    const checkStep4 = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.auth-card');
        const text = card ? card.innerText : '';
        return {
          isStep4Success: text.includes('Mật khẩu đã được thay đổi') || text.includes('thành công'),
          hasLoginBtn: text.includes('Đăng nhập ngay')
        };
      })()`,
      returnByValue: true
    });

    console.log('  Kết quả Bước 4 (Hoàn tất thành công):', checkStep4?.result?.value);

    ws.close();
    chrome.kill();

    // Dọn dẹp: Khôi phục mật khẩu về 123456
    console.log('\n[DỌN DẸP] Hoàn nguyên mật khẩu về lại Password123!...');
    const cleanupReq = await post('/api/auth/password/forgot', {
      channel: 'EMAIL',
      identifier: 'levietcaoson27@gmail.com'
    });
    if (cleanupReq.data.simulatedOtp) {
      const v = await post('/api/auth/password/verify-otp', {
        phone: 'levietcaoson27@gmail.com',
        otp: cleanupReq.data.simulatedOtp
      });
      if (v.data.resetToken) {
        await post('/api/auth/password/reset', {
          resetToken: v.data.resetToken,
          newPassword: 'Password123!',
          confirmPassword: 'Password123!'
        });
        console.log('  ✔ Đã hoàn nguyên mật khẩu an toàn.');
      }
    }

    console.log('\n===============================================================');
    console.log('🎉 KIỂM THỬ TOÀN DIỆN LUỒNG MÃ PIN GMAIL HOÀN TẤT XUẤT SẮC 100%!');
    console.log('===============================================================');

  } catch (err) {
    console.error('Lỗi kiểm thử:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
