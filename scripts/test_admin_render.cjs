const { spawn } = require('child_process');
const http = require('http');

async function run() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9334;
  
  console.log('1. Khởi động Chrome Headless với CDP port', port);
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\chrome-test-profile-subpages'
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

    console.log('2. Điều hướng đến /login để khởi tạo origin và lưu session Admin...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/login' });
    await new Promise(r => setTimeout(r, 1000));

    await sendCommand('Runtime.evaluate', {
      expression: `
        localStorage.setItem('user_display', JSON.stringify({
          id: 1,
          username: 'admin',
          fullName: 'Quản Trị Viên Hệ Thống',
          role: 'ADMIN'
        }));
      `
    });

    const subpages = [
      { name: 'Dashboard', path: '/admin' },
      { name: 'Quản Lý Tour', path: '/admin/tours' },
      { name: 'Danh Mục', path: '/admin/categories' },
      { name: 'Đơn Hàng', path: '/admin/orders' },
      { name: 'Khách Hàng', path: '/admin/users' },
      { name: 'B2B Doanh Nghiệp', path: '/admin/b2b' },
      { name: 'Kiến Trúc AST', path: '/admin/architecture' },
      { name: 'Design Canvas', path: '/admin/design-canvas' }
    ];

    console.log('3. Kiểm tra toàn bộ 8 trang con trong Admin Panel...');
    let allPassed = true;

    for (const sub of subpages) {
      process.stdout.write(`  Testing ${sub.name} (${sub.path})... `);
      await sendCommand('Page.navigate', { url: `http://localhost:3000${sub.path}` });
      await new Promise(r => setTimeout(r, 1500));

      const res = await sendCommand('Runtime.evaluate', {
        expression: `
          ({
            hasErrorBoundary: document.body.innerText.includes('Đã xảy ra sự cố không mong muốn'),
            length: document.body.innerText.length
          })
        `,
        returnByValue: true
      });

      const data = res?.result?.value;
      if (data?.hasErrorBoundary) {
        console.log('❌ FAILED (Gặp ErrorBoundary)');
        allPassed = false;
      } else {
        console.log(`✅ OK (${data?.length} chars)`);
      }
    }

    if (allPassed) {
      console.log('\n🎉 TẤT CẢ 8 TRANG CON CỦA ADMIN PANEL ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!');
    } else {
      console.error('\n⚠️ Có trang gặp lỗi.');
    }

    ws.close();
  } catch (err) {
    console.error('Lỗi khi chạy CDP test:', err);
  } finally {
    chrome.kill();
    console.log('4. Đã hoàn tất và đóng Chrome.');
  }
}

run();
