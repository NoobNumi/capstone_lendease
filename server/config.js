import dotenv from 'dotenv';
import assert from 'assert';

import neo4j from 'neo4j-driver';
import mysql from 'mysql2/promise';

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

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
  DATABASE_URL
} = process.env;
let mySqlDriver;
let driver;
var connection;
var getDbConnection;
let firebaseConfig;
let firebaseStorage;

try {
  getDbConnection = async () => {
    // $hostname = 'aiks1r.stackhero-network.com';
    // $port = '3934';
    // $user = 'root';
    // $password = 'de5Jtt5OaQr5QY0mS5Cfb1jRQUDddlPD';
    // $database = 'root'; //

    const pool = await mysql.createPool({
      port: 3934,
      host: 'aiks1r.stackhero-network.com',
      user: 'root',
      password: 'de5Jtt5OaQr5QY0mS5Cfb1jRQUDddlPD',
      database: 'sample',
      connectTimeout: 10000,
      waitForConnections: true,
      connectionLimit: 100000, // Adjust this number based on your needs
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: true // Ensure it's a secure connection
      },
      timezone: 'Asia/Manila'
    });

    // const pool = await mysql.createPool({
    //   host: 'jcqlf1.stackhero-network.com',
    //   user: 'root',
    //   password: 'OwhHbxDtBwsDB9VlClLwfkzw9MTBr70m',
    //   database: 'final_bu',
    //   port: 4300,
    //   waitForConnections: true,
    //   connectionLimit: 0, // Max number of connections in the pool
    //   queueLimit: 0,
    //   ssl: false // Disable SSL connection
    // });

    return pool;
  };

  mySqlDriver = await getDbConnection();

  // Your Firebase configuration
  firebaseConfig = {
    apiKey: 'AIzaSyAln9KogkLpr_eMbBLlnQfMae7Ji380phQ',
    authDomain: 'avdeasis-4b5c7.firebaseapp.com',
    projectId: 'avdeasis-4b5c7',
    storageBucket: 'avdeasis-4b5c7.appspot.com',
    messagingSenderId: '563212793374',
    appId: '1:563212793374:web:4a5f5dd187e0304661a00f',
    measurementId: 'G-5LTWLEWR22'
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  firebaseStorage = getStorage(app);

  // console.log({ firebaseStorage });
  console.log('DBs Connected');
} catch (err) {
  console.log(`Connection error\n${err}\nCause: ${err.cause}`);
}

let cypherQuerySession = `1`;

// let session = driver.session({ database: 'neo4j' });

// let cypherQuerySessionDriver = session;

// assert(PORT, 'Port is required');
// assert(HOST, 'Host is required');
// config
//config

let gmailEmailpassword = 'dqeq ukrn hvjg vnyx';

// Update database relationships
const dbRelationships = {
  // Loan relationships
  loan: {
    belongsTo: ['borrower_account', 'loan_officer', 'loan_setting_parameters'],
    hasMany: ['payment', 'collateral', 'disbursement_details']
  },

  // Borrower relationships
  borrower_account: {
    hasMany: ['loan', 'notification', 'guarantor'],
    hasOne: ['user_account', 'address']
  },

  // Payment relationships
  payment: {
    belongsTo: ['loan', 'payment_method', 'loan_officer'],
    hasOne: ['transaction']
  },

  // User account relationships
  user_account: {
    belongsTo: ['user_role'],
    hasOne: [
      'borrower_account',
      'collector_account',
      'admin_account',
      'loan_officer'
    ],
    hasMany: ['logs', 'user_log']
  },

  // Collector relationships
  collector_account: {
    hasOne: ['user_account'],
    hasMany: ['payment']
  },

  // Loan officer relationships
  loan_officer: {
    hasOne: ['user_account'],
    hasMany: ['loan', 'payment']
  },

  // Admin relationships
  admin_account: {
    hasOne: ['user_account'],
    hasMany: ['logs']
  },

  // Notification relationships
  notification: {
    belongsTo: ['borrower_account'],
    hasOne: ['notification_template']
  },

  // SMS relationships
  sms: {
    belongsTo: ['borrower_account', 'loan']
  },

  // QR Code relationships
  qr_code: {
    belongsTo: ['loan_application']
  },

  // Loan application relationships
  loan_application: {
    belongsTo: ['borrower_account'],
    hasOne: ['loan', 'qr_code']
  }
};

export default {
  port: PORT,
  host: HOST,
  hostUrl: HOST_URL,
  firebaseConfig,
  cypherQuerySession,
  JWT_TOKEN_SECRET,
  SENDGRID_API_KEY,
  cypherQuerySessionDriver: '',
  defaultDBName: 'neo4j',
  mySqlDriver: mySqlDriver,
  firebaseStorage,
  REACT_FRONT_END_URL: 'http://localhost:5173',
  VONAGE_apiKey: '4bd672c1',
  VONAGE_apiSecret: 'AfPrKNa0SHzObquW',
  accountSid: 'ACc2722205466c12991f0f21657440d649',
  authToken: '965d4261fd8f911431dfc5a35174ec6e'
};
