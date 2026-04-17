const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error));
    await page.goto('http://localhost:5173/admin/food');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
