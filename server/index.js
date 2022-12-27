require("dotenv").config({ path: `.env.local`, override: true });

//Code:
var ln = require("ln");
ln.PIPE_BUF = 512; //Set it in byte unit and based on the ulimit -a.
//Default is 4096.
//For example,
//pipe size            (512 bytes, -p) 2
//ln.PIPE_BUF = 512 * 2;
//This controls the atomicity of the write operation.
//Writes of {PIPE_BUF} or fewer bytes shall be atomic

var appenders = [
  {
    level: "info", //Optional. It tells the appender what level should log.
    //Default level will be "INFO" and "TRACE" if NODE_ENV=production and NODE_ENV=development respectively.
    type: "file", //It defines the appender type. "file" is reserved and "console" is the default appender.
    path: "[./log.]YYMMDDHHmm", //It defines the name and path of the log file.
    //If you want to have log rotation, please define some tokens as a part of the filename.
    //For the details and rules of tokens, you can take a look
    //http://momentjs.com/docs/#/displaying/format/.
    //Any chars inside [] will be escaped
    //If you do not need the rotation,
    //You can enclose the path with [] to be a static path, like "[./log]".
    //Be aware of using [], static path is 400% faster than dynamic path.
    isUTC: true, //Optional. It determines the tokens, "YYMMDDHHmm", is in UTC or local time
    //Default is true.
  },
  {
    level: "info",
    type: "console", //It directly outputs to console.
  },
];
var log = new ln({ name: "a", appenders: appenders });
log.e("ln"); //Android-like logging signature:
//log.trace = log.t
//log.debug = log.d
//log.info  = log.i
//log.warn  = log.w
//log.error = log.e
//log.fatal = log.f
// log.error(new Error("ln"));
// log.e("ln", new Error("ln"), { a: true });
const path = require("path");
const express = require("express");
const axios = require("axios");
const PORT = process.env.PORT || 3001;

const os = require("os");
const puppeteer = require("puppeteer");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const lighthouse = require("lighthouse");
const { URL } = require("url");

const { format } = require("date-fns");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { currentLineHeight } = require("pdfkit");

if (cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs / 2; i++) {
    cluster.fork();
  }

  cluster.once("message", (message) => {
    console.log("worker thread done: ", message.id);
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else if (cluster.isWorker) {
  // // Serve any static files
  // app.use(express.static(path.join(__dirname, "client/build")));

  // // Handle React routing, return all requests to React app
  // app.get("*", function (req, res) {
  //   res.sendFile(path.join(__dirname, "client/build", "index.html"));
  // });

  console.log(`Worker ${process.pid} started`);
  const app = express();
  // Have Node serve the files for our built React app
  // app.use(express.static(path.resolve(__dirname, "../client/build")));
  app.get("/api", (req, res) => {
    (async () => {
      var worker = cluster.worker;
      var currURL = "-1";
      var currEmail = "-1";
      // log.e("worker received api request:", currURL, currEmail);

      if (req.query.url) {
        currURL = req.query.url;
      }
      if (req.query.email) {
        currEmail = req.query.email;
      }
      console.log("worker api request starting on:", currURL, currEmail);
      try {
        // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
        const browser = await puppeteer.launch({
          headless: false,
          defaultViewport: null,
        });

        // Lighthouse will open the URL.
        // Puppeteer will observe `targetchanged` and inject our stylesheet.
        const { lhr } = await lighthouse(currURL, {
          port: new URL(browser.wsEndpoint()).port,
          output: "json",
          logLevel: "info",
          chromeFlags: "ignore-certificate-errors",
        });
        var lighthouseScores = `${Object.values(lhr.categories)
          .map((c) => c.score)
          .join(", ")}`;

        // Send result back to main thread
        process.send(currURL + "," + lighthouseScores);
        //console.log("worker : ", lighthouseScores);
        log.e("worker thread lighthouse done: ", lighthouseScores);

        var strapiData = {
          data: {
            date_created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXX"),
            site_email: currEmail,
            site_url: currURL,
            seo_result: lighthouseScores,
            initial_email: true,
          },
        };
        var strapiHeaders = {
          headers: {
            Authorization: process.env.SEO_AUDIT_KEY,
          },
        };
        // Create a new PDF document
        const doc = new PDFDocument();
        var fileName = generateRandomString(15) + ".pdf";
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
              strapiMsg = "posted to strapi: " + response.data.data.id + "\n";
              sendEmail(currEmail, currURL, fileName);
            } else {
            }
            res.setHeader("Content-Type", "application/json");
            res.json(`${strapiMsg}` + `:` + `${lighthouseScores}`);

            browser.close();
          })
          .catch(function (error) {
            strapiMsg = "axios strapi error" + error;
            console.log("strapi error ", error);
          });
      } catch (err) {
        // console.log("worker error: ", err);
        log.e("worker error: ", err);
        await browser.close();
      }

      // Send URL to be scraped to worker
      // worker.send({ some: "data", arr: [currURL, currEmail] });

      // // Receive result from worker and send it back to client
      // worker.on("message", (result) => {
      //   log.e("worker received scrape result:", result);
      //   res.send(result);
      // });

      res.on("finish", () => {
        // Code to clean up the child process goes here

        process.exit();
      });
    })();
  });

  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });

  //All other GET requests not handled before will return our React app
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
  // process.on("message", async (data) => {
  //   log.e(`worker ${worker.process.pid} starting scrape`);
  //   // Scrape URL using Lighthouse
  //   try {
  //     var currURL = data[0];
  //     var currEmail = data[1];
  //     log.e(currURL, currEmail);
  //     const { lhr } = await lighthouse(currURL, {
  //       port: new URL(currURL).port,
  //       output: "json",
  //       logLevel: "info",
  //     });
  //     var lighthouseScores = `${Object.values(lhr.categories)
  //       .map((c) => c.score)
  //       .join(", ")}`;

  //     // Send result back to main thread
  //     process.send(lighthouseScores);
  //     //console.log("worker : ", lighthouseScores);
  //     log.e("worker : ", lighthouseScores);
  //   } catch (err) {
  //     // console.log("worker error: ", err);
  //     log.e("worker error: ", err);
  //     process.exit();
  //   }
  //   // Terminate worker
  //   process.exit();
  // });
}

// app.get("/api2", (req, res) => {
//   (async () => {
//     var currURL = "https://wunderfauks.com";
//     var currEmail = "contact@wunderfauks.com";
//     console.log(req.query.url);

//     if (req.query.url) {
//       currURL = req.query.url;
//     }
//     if (req.query.email) {
//       currEmail = req.query.email;
//     }

//     // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: null,
//     });

//     try {
//       // Lighthouse will open the URL.
//       // Puppeteer will observe `targetchanged` and inject our stylesheet.
//       const { lhr } = await lighthouse(currURL, {
//         port: new URL(browser.wsEndpoint()).port,
//         output: "json",
//         logLevel: "info",
//       });

//       //console.log();
//       //res.json(lhr);
//       // res.json(

//       // );
//       var lighthouseScores = `${Object.values(lhr.categories)
//         .map((c) => c.score)
//         .join(", ")}`;

//       //To do
//       //Save results in database
//       //Save PDF
//       //Trigger Email

//       var strapiData = {
//         data: {
//           date_created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXX"),
//           site_email: currEmail,
//           site_url: currURL,
//           seo_result: lighthouseScores,
//         },
//       };
//       var strapiHeaders = {
//         headers: {
//           Authorization: process.env.SEO_AUDIT_KEY,
//         },
//       };
//       // Create a new PDF document
//       const doc = new PDFDocument();
//       var fileName = "output.pdf";
//       // Add some text and a rectangle
//       doc.text("SEO Scores for: " + currURL + "\n");
//       doc.text(lighthouseScores);

//       // Save the PDF to a file
//       doc.pipe(fs.createWriteStream("./uploads/" + fileName));
//       doc.end();

//       var strapiMsg = "";
//       const strapiResults = await axios
//         .post(process.env.SEO_AUDIT_RESULTS_URL, strapiData, strapiHeaders)
//         .then(function (response) {
//           console.log(response.data);
//           if (response.data) {
//             strapiMsg = "posted to strapi: " + response.data.data.id + "\n";
//             sendEmail(currEmail, currURL, fileName);
//           } else {
//           }
//           res.setHeader("Content-Type", "application/json");
//           res.json(`${strapiMsg}` + `:` + `${lighthouseScores}`);
//           res.end();
//         })
//         .catch(function (error) {
//           strapiMsg = "axios strapi error" + error;
//           console.log("strapi error ", error);
//         });
//     } catch (err) {
//       res.json(err.message);
//     } finally {
//       //res.json(`Done`);
//     }

//     await browser.close();
//   })();
// });

// app.get("/api3", (req, res) => {
//   (async () => {
//     var currURL = "https://wunderfauks.com";
//     var currEmail = "contact@wunderfauks.com";
//     console.log(req.query.url);

//     if (req.query.url) {
//       currURL = req.query.url;
//     }
//     if (req.query.email) {
//       currEmail = req.query.email;
//     }

//     scrapeLightHouse(res, currEmail, currURL);
//   })();
// });

async function scrapeLightHouse(res, userEmail, userURL) {
  // lighthouse(url, {
  //   output: "html",
  // }).then((results) => {
  //   console.log(`Lighthouse results for ${url}:`);
  //   console.log(results);
  // });
  try {
    const { lhr } = await lighthouse(userURL, {
      //  port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "info",
    });
    var lighthouseScores = `${Object.values(lhr.categories)
      .map((c) => c.score)
      .join(", ")}`;

    var strapiMsg = "worker test";
    res.setHeader("Content-Type", "application/json");
    res.json(`${strapiMsg}` + `:` + `${lighthouseScores}`);
    res.end();
  } catch (err) {
    res.json(err.message);
  }
}

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

const generateRandomString = (myLength) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};
