const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', async res => {
    if(res.status() === 401) {
      console.log('401 URL:', res.url());
      try {
        const text = await res.text();
        console.log('401 BODY:', text);
      } catch(e) {}
    }
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await browser.close();
})();
