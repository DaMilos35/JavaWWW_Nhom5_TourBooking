const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9345;
  
  console.log('1. Khởi động Chrome Headless với CDP port', port);
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\chrome-test-pw-ui'
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
    const wsUrl = page.webSocketDebuggerUrl;

    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(wsUrl);

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
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type;
        const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
        if (type === 'error') {
          console.log('  [CONSOLE ERROR]:', text);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const text = msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || '');
        console.log('  [UNCAUGHT EXCEPTION]:', text);
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

    console.log('2. Điều hướng đến http://localhost:3000/forgot-password...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/forgot-password' });
    await new Promise(r => setTimeout(r, 2000));

    // Kiểm tra các nút trên trang
    console.log('3. Chọn nút email thật: levietcaoson27@gmail.com...');
    const clickQuickFill = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.innerText.includes('levietcaoson27@gmail.com'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('  -> Nút quick-fill được nhấn:', clickQuickFill?.result?.value);
    await new Promise(r => setTimeout(r, 500));

    // Submit form
    console.log('4. Gửi yêu cầu đặt lại mật khẩu...');
    const submitResult = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('  -> Form đã submit:', submitResult?.result?.value);

    // Chờ phản hồi API và render màn hình EMAIL_SENT
    await new Promise(r => setTimeout(r, 2500));

    const checkSent = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.auth-card');
        const text = card ? card.innerText : '';
        return {
          hasEmailSentText: text.includes('Đã Kích Hoạt') || text.includes('Đã gửi'),
          hasTargetEmail: text.includes('levietcaoson27@gmail.com'),
          hasNoPassRelayBadge: text.includes('Không Cần Password') || text.includes('Kênh Trung Gian'),
          hasFastTrackBtn: text.includes('Đặt Mật Khẩu Mới Ngay Lập Tức'),
          hasGmailBtn: text.includes('Mở Hộp Thư Gmail'),
          hasCopyBtn: text.includes('Sao chép liên kết'),
          rawTextSnippet: text.slice(0, 300)
        };
      })()`,
      returnByValue: true
    });

    console.log('5. Kết quả màn hình EMAIL_SENT:\n', checkSent?.result?.value);

    // Nhấn nút Fast-Track: "Đặt Mật Khẩu Mới Ngay Lập Tức"
    console.log('6. Nhấn nút chuyển tiếp nhanh "Đặt Mật Khẩu Mới Ngay Lập Tức"...');
    const fastTrackClick = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText.includes('Đặt Mật Khẩu Mới Ngay Lập Tức'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('  -> Nút Fast-Track được nhấn:', fastTrackClick?.result?.value);

    await new Promise(r => setTimeout(r, 1000));

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

    console.log('7. Kết quả màn hình ĐẶT MẬT KHẨU MỚI (Step 3):\n', checkStep3?.result?.value);

    ws.close();
    chrome.kill();

    const sent = checkSent?.result?.value;
    const step3 = checkStep3?.result?.value;

    if (sent?.hasTargetEmail && sent?.hasFastTrackBtn && step3?.isStep3 && step3?.passwordInputsCount >= 2) {
      console.log('\n===============================================================');
      console.log('🎉 KIỂM THỬ GIAO DIỆN QUÊN MẬT KHẨU HOÀN TOÀN XUẤT SẮC 100%!');
      console.log('===============================================================');
    } else {
      throw new Error('Kiểm thử giao diện thất bại!');
    }

  } catch (err) {
    console.error('Lỗi kiểm thử:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
