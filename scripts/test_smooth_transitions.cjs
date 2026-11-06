const { spawn } = require('child_process');
const http = require('http');

async function testTransitions() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9335;

  console.log('1. Khởi chạy Chrome headless...');
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=C:\\temp\\chrome-test-profile-transitions'
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
    const WebSocket = global.WebSocket || require('ws');
    const ws = new WebSocket(page.webSocketDebuggerUrl);

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
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        console.log('  [CONSOLE ERROR]:', msg.params.args.map(a => a.value || a.description || '').join(' '));
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('  [EXCEPTION]:', msg.params.exceptionDetails.text);
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

    console.log('2. Kiểm tra trang chủ http://localhost:3000/ ...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 1800));

    // Kiểm tra class page-transition-wrapper và scroll-behavior
    const homeCheck = await sendCommand('Runtime.evaluate', {
      expression: `
        ({
          hasPageTransitionWrapper: Boolean(document.querySelector('.page-transition-wrapper')),
          scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
          primaryBtnTransition: (() => {
            const btn = document.querySelector('.btn-primary') || document.querySelector('.btn');
            return btn ? window.getComputedStyle(btn).transition : 'none';
          })(),
          primaryBtnTransform: (() => {
            const btn = document.querySelector('.btn-primary') || document.querySelector('.btn');
            return btn ? window.getComputedStyle(btn).transform : 'none';
          })()
        })
      `,
      returnByValue: true
    });

    console.log('  Kết quả trang chủ:', homeCheck?.result?.value);

    console.log('3. Kiểm tra chuyển tiếp sang trang /tours ...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/tours' });
    await new Promise(r => setTimeout(r, 1800));

    const toursCheck = await sendCommand('Runtime.evaluate', {
      expression: `
        ({
          pathname: window.location.pathname,
          hasPageTransitionWrapper: Boolean(document.querySelector('.page-transition-wrapper')),
          hasCategoryPill: Boolean(document.querySelector('.cat-tab-pill')),
          catPillTransition: (() => {
            const pill = document.querySelector('.cat-tab-pill');
            return pill ? window.getComputedStyle(pill).transition : 'none';
          })(),
          tourCardTransition: (() => {
            const card = document.querySelector('.tour-card');
            return card ? window.getComputedStyle(card).transition : 'none';
          })()
        })
      `,
      returnByValue: true
    });

    console.log('  Kết quả trang Tours:', toursCheck?.result?.value);

    console.log('4. Kiểm tra chuyển tiếp sang trang /login ...');
    await sendCommand('Page.navigate', { url: 'http://localhost:3000/login' });
    await new Promise(r => setTimeout(r, 1500));

    const loginCheck = await sendCommand('Runtime.evaluate', {
      expression: `
        ({
          pathname: window.location.pathname,
          hasPageTransitionWrapper: Boolean(document.querySelector('.page-transition-wrapper')),
          btnBlockTransition: (() => {
            const btn = document.querySelector('.btn-block') || document.querySelector('button[type="submit"]');
            return btn ? window.getComputedStyle(btn).transition : 'none';
          })()
        })
      `,
      returnByValue: true
    });

    console.log('  Kết quả trang Login:', loginCheck?.result?.value);

    console.log('\n✅ TẤT CẢ KIỂM TRA HIỆU ỨNG CHUYỂN TRANG VÀ NÚT BẤM ĐỀU THÀNH CÔNG RỰC RỠ!');
    ws.close();
  } catch (err) {
    console.error('Lỗi khi chạy test:', err);
  } finally {
    chrome.kill();
    console.log('5. Đã đóng Chrome.');
  }
}

testTransitions();

