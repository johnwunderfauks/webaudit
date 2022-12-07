const path = require("path");
const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const { URL } = require("url");

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
  (async () => {
    var currURL = "https://wunderfauks.com";
    console.log(req.query.url);

    if (req.query.url) {
      currURL = req.query.url;
    }

    // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    // Wait for Lighthouse to open url, then inject our stylesheet.
    browser.on("targetchanged", async (target) => {
      const page = await target.page();
      if (page && page.url() === currURL) {
        //await page.addStyleTag({content: '* {color: red}'});
        //await sessionStorage.clear();
      }
    });

    try {
      // Lighthouse will open the URL.
      // Puppeteer will observe `targetchanged` and inject our stylesheet.
      const { lhr } = await lighthouse(currURL, {
        port: new URL(browser.wsEndpoint()).port,
        output: "json",
        logLevel: "info",
      }, {
        extends: 'lighthouse:default',
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

          // Content
          "seo/meta-description",
          "accessibility/frame-title",
          "accessibility/document-title",
          "accessibility/heading-order",

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
            ]
          },
          content: {
            title: 'Content',
            description: '',
            auditRefs: [
              { id: 'meta-description', weight: 1 },
              { id: 'frame-title', weight: 1 },
              { id: 'document-title', weight: 1 },
              { id: 'heading-order', weight: 1 }
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
          },
        }
      });

      //console.log();
      //res.json(lhr);
      // res.json(

      // );
      var lighthouseScores = `${Object.values(lhr.categories)
        .map((c) => c.score)
        .join(", ")}`;
      res.setHeader("Content-Type", "application/json");
      res.json(`${lighthouseScores}`);
      res.end();
    } catch (err) {
      res.json(err.message);
    } finally {
      //res.json(`Done`);
    }

    await browser.close();
  })();
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

//All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
