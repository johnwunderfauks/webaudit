const path = require("path");
const express = require("express");
const axios = require("axios");
const PORT = process.env.PORT || 3001;

const app = express();

const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const { URL } = require("url");

const { format } = require("date-fns");

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("/api", (req, res) => {
  (async () => {
    var currURL = "https://wunderfauks.com";
    var currEmail = "contact@wunderfauks.com";
    console.log(req.query.url);

    if (req.query.url) {
      currURL = req.query.url;
    }
    if (req.query.email) {
      currEmail = req.query.email;
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

      //To do
      //Save results in database
      //Trigger Email
      var strapiData = {
        data: {
          date_created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXX"),
          site_email: currEmail,
          site_url: currURL,
          seo_result: lighthouseScores,
        },
      };
      var strapiHeaders = {
        headers: {
          Authorization: `Bearer 856508b10ec7546ea7c8a92ce5ad27782c9bf44e322a56da87000342809e72f5c3bb6d93a168b2282e27752cb19f95e8ce1c9723f1835b10ab48ecfe3a89cd772caeec248cc3e01a9355240a478dcae50bb898e6c7e44e43a45725ad859b6a3f3a9a23e72eb060444ef8ad557dff329fcca22479271fd08080b7efa21c4bbed9`,
        },
      };
      var strapiMsg = "";
      const strapiResults = await axios
        .post(
          "http://127.0.0.1:1338/api/seo-audit-results",
          strapiData,
          strapiHeaders
        )
        .then(function (response) {
          console.log(response.data);
          if (response.data) {
            strapiMsg = "posted to strapi: " + response.data.id + "\n";
          }
        })
        .catch(function (error) {
          strapiMsg = "axios strapi error" + error;
        });

      res.setHeader("Content-Type", "application/json");
      res.json(`${strapiMsg}` + `:` + `${lighthouseScores}`);
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
