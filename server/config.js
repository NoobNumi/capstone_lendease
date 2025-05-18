import dotenv from "dotenv";
import assert from "assert";

import neo4j from "neo4j-driver";
import mysql from "mysql2/promise";

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

//import mysql from 'promise-mysql';
dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  JWT_TOKEN_SECRET,
  NEO4J_URI,
  NEO4J_USER,
  NEO4J_PASSWORD,
  SENDGRID_API_KEY,
  DATABASE_URL,
} = process.env;
let mySqlDriver;
let driver;
var connection;
var getDbConnection;
let firebaseConfig;
let firebaseStorage;

try {
  getDbConnection = async () => {
    // const pool = await mysql.createPool({
    //   port: process.env.DB_PORT,
    //   host: process.env.DB_HOST,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   connectTimeout: 10000,
    //   waitForConnections: true,
    //   connectionLimit: 100000,
    //   queueLimit: 0,
    //   timezone: "+08:00",
    // });

    const pool = await mysql.createPool({
      host: "i5n14z.stackhero-network.com",
      user: "root",
      password: "9BRo3OabPJ8wFd1FMr4Q1Yc29Ec2oYH3",
      database: "lendease",
      port: 7273,
      waitForConnections: true,
      connectionLimit: 0, // Max number of connections in the pool
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: true,
      },
    });

    return pool;
  };

  mySqlDriver = await getDbConnection();

  // Your Firebase configuration
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  firebaseStorage = getStorage(app);

  // console.log({ firebaseStorage });
  console.log("DBs Connected");
} catch (err) {
  console.log(`Connection error\n${err}\nCause: ${err.cause}`);
}

let cypherQuerySession = `1`;

// Update database relationships
const dbRelationships = {
  // Loan relationships
  loan: {
    belongsTo: ["borrower_account", "loan_officer", "loan_setting_parameters"],
    hasMany: ["payment", "collateral", "disbursement_details"],
  },

  // Borrower relationships
  borrower_account: {
    hasMany: ["loan", "notification", "guarantor"],
    hasOne: ["user_account", "address"],
  },

  // Payment relationships
  payment: {
    belongsTo: ["loan", "payment_method", "loan_officer"],
    hasOne: ["transaction"],
  },

  // User account relationships
  user_account: {
    belongsTo: ["user_role"],
    hasOne: [
      "borrower_account",
      "collector_account",
      "admin_account",
      "loan_officer",
    ],
    hasMany: ["logs", "user_log"],
  },

  // Collector relationships
  collector_account: {
    hasOne: ["user_account"],
    hasMany: ["payment"],
  },

  // Loan officer relationships
  loan_officer: {
    hasOne: ["user_account"],
    hasMany: ["loan", "payment"],
  },

  // Admin relationships
  admin_account: {
    hasOne: ["user_account"],
    hasMany: ["logs"],
  },

  // Notification relationships
  notification: {
    belongsTo: ["borrower_account"],
    hasOne: ["notification_template"],
  },

  // SMS relationships
  sms: {
    belongsTo: ["borrower_account", "loan"],
  },

  // QR Code relationships
  qr_code: {
    belongsTo: ["loan_application"],
  },

  // Loan application relationships
  loan_application: {
    belongsTo: ["borrower_account"],
    hasOne: ["loan", "qr_code"],
  },
};

export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  firebaseConfig,
  cypherQuerySession,
  JWT_TOKEN_SECRET,
  SENDGRID_API_KEY,
  cypherQuerySessionDriver: "",
  // defaultDBName: "neo4j",
  defaultDBName: "mysql",
  mySqlDriver: mySqlDriver,
  firebaseStorage,
  REACT_FRONT_END_URL: "https://lendease-jeqd.onrender.com/",
  // REACT_FRONT_END_URL: 'http://localhost:5173',
  VONAGE_apiKey: process.env.VONAGE_API_KEY,
  VONAGE_apiSecret: process.env.VONAGE_API_SECRET,
  accountSid: process.env.ACCOUNT_SID,
  authToken: process.env.AUTH_TOKEN,
  XENDIT_WEBHOOK_VERIFICATION_TOKEN:
    process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN,
  XENDIT_API_URL: process.env.XENDIT_API_URL,
  XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
};
