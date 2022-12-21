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
}, {
  extends: 'lighthouse:default',
  passes: [
    {
      passName: 'defaultPass',
      gatherers: [
        'custom-audits/gatherers/h1-elements',
        'custom-audits/gatherers/head-elements',
        'custom-audits/gatherers/content-elements',
      ]
    }
  ],
  settings: {
    onlyCategories: ['technical', 'content', 'experience', 'mobile'],
  },
  audits: [
    // Technical
    "is-on-https",
    "seo/robots-txt",
    "oopif-iframe-test-audit",
    "dobetterweb/uses-http2",
    "seo/http-status-code",
    "redirects",
    "seo/manual/structured-data",
    "dobetterweb/dom-size",
    "metrics/speed-index",
    "third-party-summary",
    "seo/canonical",
    "seo/is-crawlable",
    "seo/crawlable-anchors",
    "custom-audits/audits/meta-og-tags",
    "custom-audits/audits/link-to-http",

    // Content
    "seo/meta-description",
    "accessibility/frame-title",
    "accessibility/document-title",
    "accessibility/heading-order",
    "custom-audits/audits/h1-tag",
    "custom-audits/audits/meta-description-length",
    "custom-audits/audits/meta-description-count",
    "custom-audits/audits/document-title-length",
    "custom-audits/audits/dead-end-page",
    "custom-audits/audits/unsafe-links",
    "custom-audits/audits/content-word-count",

    // Experience
    "unsized-images",
    "byte-efficiency/uses-optimized-images",
    "accessibility/image-alt",
    "accessibility/input-image-alt",
    "image-size-responsive",
    "byte-efficiency/uses-responsive-images",
    "image-aspect-ratio",

    // Mobile
    "seo/font-size",
    "viewport",
    "accessibility/meta-viewport",
    "content-width",
  ],
  categories: {
    technical: {
      title: 'Technical',
      description: '',
      auditRefs: [
        { id: 'is-on-https', weight: 1 },
        { id: 'robots-txt', weight: 1 },
        { id: 'oopif-iframe-test-audit', weight: 1 },
        { id: 'uses-http2', weight: 1 },
        { id: 'http-status-code', weight: 1 },
        { id: 'redirects', weight: 1 },
        { id: 'structured-data', weight: 0 },
        { id: 'dom-size', weight: 1 },
        { id: 'speed-index', weight: 1 },
        { id: 'third-party-summary', weight: 1 },
        { id: 'canonical', weight: 1 },
        { id: 'is-crawlable', weight: 1 },
        { id: 'crawlable-anchors', weight: 1 },
        { id: 'meta-og-tags', weight: 1 },
        { id: 'link-to-http', weight: 1 },
      ]
    },
    content: {
      title: 'Content',
      description: '',
      auditRefs: [
        { id: 'meta-description', weight: 1 },
        { id: 'frame-title', weight: 1 },
        { id: 'document-title', weight: 1 },
        { id: 'heading-order', weight: 1 },
        { id: 'h1-tag', weight: 1 },
        { id: 'meta-description-length', weight: 1 },
        { id: 'meta-description-count', weight: 1 },
        { id: 'document-title-length', weight: 1 },
        { id: 'dead-end-page', weight: 1 },
        { id: 'unsafe-links', weight: 1 },
        { id: 'content-word-count', weight: 1 },
      ]
    },
    experience: {
      title: 'Experience',
      description: '',
      auditRefs: [
        { id: 'unsized-images', weight: 1 },
        { id: 'uses-optimized-images', weight: 1 },
        { id: 'image-alt', weight: 1 },
        { id: 'input-image-alt', weight: 1 },
        { id: 'image-size-responsive', weight: 1 },
        { id: 'uses-responsive-images', weight: 1 },
        { id: 'image-aspect-ratio', weight: 1 },
      ]
    },
    mobile: {
      title: 'Mobile',
      description: '',
      auditRefs: [
        { id: 'font-size', weight: 1 },
        { id: 'viewport', weight: 1 },
        { id: 'meta-viewport', weight: 1 },
        { id: 'content-width', weight: 1 }
      ]
    }
  }
});

console.log(lhr);
// console.log(`Lighthouse scores: ${Object.values(lhr.categories).map(c => c.score).join(', ')}`);

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