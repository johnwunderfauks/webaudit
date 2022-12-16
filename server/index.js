require("dotenv").config({ path: `.env.local`, override: true });
console.log(process.env.SEO_AUDIT_RESULTS_URL);
const path = require("path");
const express = require("express");
const axios = require("axios");
const PORT = process.env.PORT || 3001;

const app = express();

const puppeteer = require("puppeteer");
const lighthouse = require("lighthouse");
const { URL } = require("url");

const { format } = require("date-fns");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

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
      //Save PDF
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
          Authorization: process.env.SEO_AUDIT_KEY,
        },
      };
      // Create a new PDF document
      const doc = new PDFDocument();
      var fileName = "output.pdf";
      // Add some text and a rectangle
      doc.text("SEO Scores for: " + currURL + "\n");
      doc.text(lighthouseScores);

      // Save the PDF to a file
      doc.pipe(fs.createWriteStream("./uploads/" + fileName));
      doc.end();

      var strapiMsg = "";
      const strapiResults = await axios
        .post(process.env.SEO_AUDIT_RESULTS_URL, strapiData, strapiHeaders)
        .then(function (response) {
          console.log(response.data);
          if (response.data) {
            strapiMsg = "posted to strapi: " + response.data.id + "\n";
            sendEmail(currEmail, currURL, fileName);
          } else {
          }
        })
        .catch(function (error) {
          strapiMsg = "axios strapi error" + error;
          console.log("strapi error ", error);
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

async function sendEmail(userEmail, userURL, pdf) {
  try {
    //let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport

    let transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.EMAIL_HOST, //smtp.ethereal.email
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });

    //Verify connection
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"SEO Tools Wunderfauks" <seotest@wunderfauks.com>', // sender address
      to: userEmail + ", " + userEmail, // list of receivers
      subject: "Your SEO Results for " + userURL, // Subject line
      text: "Testing 123", // plain text body
      html: "<b>Testing 123</b>", // html body,
      attachments: [
        {
          filename: pdf,
          path: "./uploads/" + pdf,
        },
      ],
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (error) {
    console.log(error);
  }
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

//All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
