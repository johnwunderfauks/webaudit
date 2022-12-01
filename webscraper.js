const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {URL} = require('url');

(async() => {
const url = 'https://wunderfauks.com';

// Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
});

// Wait for Lighthouse to open url, then inject our stylesheet.
browser.on('targetchanged', async target => {
  const page = await target.page();
  if (page && page.url() === url) {
    await page.addStyleTag({content: '* {color: red}'});
  }
});

// Lighthouse will open the URL.
// Puppeteer will observe `targetchanged` and inject our stylesheet.
const {lhr} = await lighthouse(url, {
  port: (new URL(browser.wsEndpoint())).port,
  output: 'json',
  logLevel: 'info',
});

console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);

await browser.close();
})();

// const fs = require('fs');
// const lighthouse = require('lighthouse');
// const puppeteer = require('puppeteer');

// const chromeLauncher = require('chrome-launcher');
// const reportGenerator = require('lighthouse/lighthouse-core/report/report-generator');
// const request = require('request');
// const util = require('util');

// const options = {
//   logLevel: 'info',
//   disableDeviceEmulation: true,
//   chromeFlags: ['--disable-mobile-emulation']
// };

// async function lighthouseFromPuppeteer(url, options, config = null) {
//   // Launch chrome using chrome-launcher
//   const chrome = await chromeLauncher.launch(options);
//   options.port = chrome.port;

//   // Connect chrome-launcher to puppeteer
//   const resp = await util.promisify(request)(`http://localhost:${options.port}/json/version`);
//   const { webSocketDebuggerUrl } = JSON.parse(resp.body);
//   const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });

//   // Run Lighthouse
//   const { lhr } = await lighthouse(url, options, config);
//   await browser.disconnect();
//   await chrome.kill();

//   const json = reportGenerator.generateReport(lhr, 'json');

//   const audits = JSON.parse(json).audits; // Lighthouse audits
//   const first_contentful_paint = audits['first-contentful-paint'].displayValue;
//   const total_blocking_time = audits['total-blocking-time'].displayValue;
//   const time_to_interactive = audits['interactive'].displayValue;

//   console.log(`\n
//      Lighthouse metrics: 
//      🎨 First Contentful Paint: ${first_contentful_paint}, 
//      ⌛️ Total Blocking Time: ${total_blocking_time},
//      👆 Time To Interactive: ${time_to_interactive}`);
// }

// lighthouseFromPuppeteer("https://wunderfauks.com", options);