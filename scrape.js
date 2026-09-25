const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://www.instagram.com/p/Dc7JjvKEvuJ/', { waitUntil: 'networkidle2' });
  
  // Try to find images
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('scontent'));
  });
  
  console.log(JSON.stringify(imgs));
  await browser.close();
})();
