import express from "express";
import cors from "cors";

import config from "./config.js";
import loanAdminRoute from "./routes/admin/loan.js";
import loanRoute from "./routes/loan.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/admin/admin.js";
import adminStatsRoute from "./routes/admin/statistics.js";
import borrowerRoute from "./routes/admin/borrower.js";
import loanOfficerRoute from "./routes/admin/loan_officer.js";
import detailedBorrowerRoute from "./routes/detailedBorrower.js";
import collectorRoute from "./routes/admin/collector.js";
import paymentHistoryRoute from "./routes/paymentHistory.js";

import financialOverviewRoute from "./routes/admin/statistics.js";

import authRoute from "./routes/auth.js";
import smsRoute from "./routes/sms.js";
import settingsRoute from "./routes/settings.js";
import bodyParser from "body-parser";

import path from "path";
import { fileURLToPath } from "url";
import { Vonage } from "@vonage/server-sdk";

// import config from './config.js';

const vonage = new Vonage({
  apiKey: config.VONAGE_apiKey,
  apiSecret: config.VONAGE_apiSecret,
});

import cron from "node-cron";
// const { cypherQuerySession } = config;
// import { mergeUserQuery } from './cypher/child.js';
// import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const app = express();
// for parsing application/json
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

app.use(cors());
app.use(express.json());

app.use("/api/loan", loanRoute);
app.use("/api/admin/loan", loanAdminRoute);

app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/admin/borrower", borrowerRoute);

app.use("/api/admin/loan_officer", loanOfficerRoute);
app.use("/api/admin/collector", collectorRoute);

app.use("/api/admin_stats/statistics", adminStatsRoute);

app.use("/api/admin_stats/statistics", adminStatsRoute);

app.use("/api/admin_reports", financialOverviewRoute);

app.use("/api/auth", authRoute);
app.use("/api/sms", smsRoute);

app.use("/api/settings", settingsRoute);

app.use("/api/borrower", detailedBorrowerRoute);

app.use("/api/payment_history", paymentHistoryRoute);

app.use(express.static("public"));
app.use(express.static("files"));

app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(config.port, async () => {
  // try {
  //   await vonage.sms
  //     .send({
  //       to: '639275478620',
  //       from: '639914762429',
  //       text: 'Hi Goodmorning'
  //     })
  //     .then(resp => {
  //       // console.log('Message sent successfully');
  //       console.log(resp);
  //     });
  // } catch (error) {
  //   console.log(error);
  // }
  console.log(`Hello Server is live`);
});

// Gracefully close MySQL connection pool
process.on("SIGINT", async () => {
  console.log("Closing MySQL connection pool...");
  if (config.mySqlDriver) {
    await config.mySqlDriver.end(); // ✅ Close MySQL pool
    console.log("MySQL connection pool closed.");
  }
  process.exit();
});
