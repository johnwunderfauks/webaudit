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
