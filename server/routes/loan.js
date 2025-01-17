import express from 'express';

import config from '../config.js';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
let firebaseStorage = config.firebaseStorage;
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const accountSid = 'ACbe246063583580e176da8274a8071c4a'; // Replace with your Twilio Account SID
const authToken = 'faa226819bb25872991f707ec4e2d2d2'; // Replace with your Twilio Auth Token
import twilio from 'twilio'; // Use import statement for Twilio
import { Vonage } from '@vonage/server-sdk';

const loanCreationMessage = ({
  firstName,
  lastName,
  loanAmount,
  loanId
}) => `Dear ${firstName} ${lastName},

Your loan application (Loan ID: ${loanId}) for the amount of ${loanAmount} has been successfully created. Our team will review your application and get back to you shortly.

Thank you for choosing us!`;

const sendMessage = async ({
  firstName,
  lastName,
  phoneNumber,
  messageType,
  additionalData = {}
}) => {
  const client = twilio(accountSid, authToken);
  const templates = {
    loanCreation: loanCreationMessage
  };

  const text = templates[messageType]
    ? templates[messageType]({ firstName, lastName, ...additionalData })
    : 'No valid message type provided.';

  const from = 'YourCompany'; // Set your company name or short code as sender
  const to = phoneNumber;

  try {
    const vonage = new Vonage({
      apiKey: '96c9acc9',
      apiSecret: 'OR9Ypw0s0EKw58I9'
    });
    // await vonage.sms.send(
    //   { to, from, text: messageText },
    //   (error, response) => {
    //     if (error) {
    //       console.error('Failed to send message:', error);
    //     } else {
    //       console.log('Message sent successfully:', response);
    //     }
    //   }
    // );
    console.log({ to, from, text });
    await vonage.sms.send({ to, from, text }).then(resp => {
      console.log('Message sent successfully');
      console.log(resp);
    });
  } catch (error) {
    console.error('Error occurred while sending message:', error);
  }
};

// Function to evaluate loan application with detailed breakdown and explanations
const evaluateLoanApplicationWithDetailedBreakdown = (
  application,
  parameters
) => {
  const { creditScore, monthlyIncome, loanAmount, employmentYears } =
    application;
  const {
    minCreditScore,
    minMonthlyIncome,
    maxLoanToIncomeRatio,
    minEmploymentYears
  } = parameters;

  // Calculate credit score percentage
  const creditScorePercentage =
    creditScore >= minCreditScore ? 100 : (creditScore / minCreditScore) * 100;
  const creditScoreMessage =
    creditScore >= minCreditScore
      ? 'Credit score meets the required threshold.'
      : `Credit score is lower than the required minimum of ${minCreditScore}. (${creditScorePercentage.toFixed(
          2
        )}%)`;

  // Calculate income percentage
  const incomePercentage =
    monthlyIncome >= minMonthlyIncome
      ? 100
      : (monthlyIncome / minMonthlyIncome) * 100;
  const incomeMessage =
    monthlyIncome >= minMonthlyIncome
      ? 'Income meets the required minimum.'
      : `Income is below the required minimum of ${minMonthlyIncome}. (${incomePercentage.toFixed(
          2
        )}%)`;

  // Calculate loan-to-income ratio percentage
  const maxLoanAmount = monthlyIncome * 12 * maxLoanToIncomeRatio;
  const loanToIncomePercentage =
    loanAmount <= maxLoanAmount ? 100 : (maxLoanAmount / loanAmount) * 100;
  const loanToIncomeMessage =
    loanAmount <= maxLoanAmount
      ? 'Loan amount is within the acceptable loan-to-income ratio.'
      : `Loan amount exceeds the allowed limit based on income (${loanToIncomePercentage.toFixed(
          2
        )}%).`;

  // Calculate employment years percentage
  const employmentYearsPercentage =
    employmentYears >= minEmploymentYears
      ? 100
      : (employmentYears / minEmploymentYears) * 100;
  const employmentYearsMessage =
    employmentYears >= minEmploymentYears
      ? 'Employment history meets the required duration.'
      : `Employment history is below the required minimum of ${minEmploymentYears} years. (${employmentYearsPercentage.toFixed(
          2
        )}%)`;

  // Final approval decision based on the lowest percentage
  const overallApprovalPercentage = Math.min(
    creditScorePercentage,
    incomePercentage,
    loanToIncomePercentage,
    employmentYearsPercentage
  );

  // Construct approval/denial message
  let approvalMessage = 'Loan application approved.';

  if (overallApprovalPercentage < 100) {
    approvalMessage =
      'Loan application denied due to the following criteria not meeting the required thresholds:';
  }

  return {
    approved: overallApprovalPercentage === 100,
    message: approvalMessage,
    breakdown: {
      creditScore: {
        percentage: creditScorePercentage,
        message: creditScoreMessage
      },
      income: {
        percentage: incomePercentage,
        message: incomeMessage
      },
      loanToIncomeRatio: {
        percentage: loanToIncomePercentage,
        message: loanToIncomeMessage
      },
      employmentYears: {
        percentage: employmentYearsPercentage,
        message: employmentYearsMessage
      }
    },
    overallApprovalPercentage
  };
};

const getBorrowerAccountByUserAccountId = async userId => {
  const [rows] = await db.query(
    `

SELECT borrower_id  FROM user_account WHERE user_id = ? 
      
       
       `,
    [userId]
  );

  return rows[0].borrower_id;
};

router.post('/checkLoanApplicationApprovalRate', async (req, res) => {
  let loan_application_id = req.body.loan_application_id; // User loan application details
  let application = req.body.application; // User loan application details
  const loanType = req.body.loanType; // Example: "personal", "business", "mortgage"

  try {
    const [rows] = await db.query(
      `
  
 SELECT b.*, l.loan_amount
  FROM borrower_account b JOIN loan l ON b.borrower_id = l.borrower_id 
 WHERE l.loan_id = ?;
        
         
         `,
      [loan_application_id]
    );

    // Default parameters for loan evaluation
    const loanParameters = {
      personal: {
        minCreditScore: 700,
        minMonthlyIncome: 15000,
        maxLoanToIncomeRatio: 0.5,
        minEmploymentYears: 2
      }
    };

    // Select parameters based on loan type
    const selectedParameters =
      loanParameters[loanType] || loanParameters['personal'];

    // // Validate application input
    // if (
    //   !application ||
    //   !application.creditScore ||
    //   !application.monthlyIncome ||
    //   !application.loanAmount ||
    //   application.employmentYears === undefined
    // ) {
    //   return res.status(400).json({
    //     error:
    //       'Provide all required fields: creditScore, monthlyIncome, loanAmount, employmentYears.'
    //   });
    // }

    // Evaluate the loan application with detailed breakdown

    let borrowerInfo = rows[0];

    application = {
      creditScore: borrowerInfo.credit_score,
      monthlyIncome: borrowerInfo.monthly_income,
      loanAmount: borrowerInfo.loan_amount,
      employmentYears: borrowerInfo.employment_years
    };
    const result = evaluateLoanApplicationWithDetailedBreakdown(
      application,
      selectedParameters
    );

    res.status(201).json({
      success: true,
      data: {
        result
      }
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
});
router.post(
  '/create',
  authenticateUserMiddleware,

  async (req, res) => {
    const data = req.body;

    const {
      proposed_loan_amount,
      loan_type,
      loan_type_specific,
      calculatorLoanAmmount,
      calculatorInterestRate,
      calculatorMonthsToPay
    } = data;

    let { user_id } = req.user;
    // console.log({ data });

    let borrower_id = await getBorrowerAccountByUserAccountId(user_id);
    // map to db
    let loan_application_id = uuidv4();
    let loan_amount = calculatorLoanAmmount || proposed_loan_amount;
    let repayment_schedule_id = calculatorMonthsToPay;
    let loan_type_value = loan_type || loan_type_specific;
    let interest_rate = calculatorInterestRate;
    let loan_status = 'Pending';
    let purpose = loan_type_specific;
    let remarks = '';

    try {
      await db.query(
        `INSERT INTO loan_application (application_id, borrower_id, loan_amount, status, qr_code_id)
       VALUES (?, ?, ?, ?, ?)`,
        [loan_application_id, borrower_id, loan_amount, loan_status, 1]
      );

      //  insert into loan table

      const [result] = await db.query(
        `INSERT INTO loan 
        (
       loan_application_id, 
       borrower_id, 
       loan_type_value,
       loan_amount, 
       interest_rate, 
       loan_status, 
       purpose, 
       remarks,
       repayment_schedule_id
       
       ) 
       VALUES ( ?, ?, ?, ?, ? ,?, ?,?,?)`,
        [
          loan_application_id,
          borrower_id,
          loan_type_value,
          loan_amount,
          interest_rate,
          loan_status,
          purpose,
          remarks,
          repayment_schedule_id
        ]
      );

      const loanId = result.insertId;
      // insert QR CODE
      await db.query(`INSERT INTO qr_code ( code, type) VALUES ( ?, ?)`, [
        loan_application_id,
        'Loan Application'
      ]);

      const [rows1] = await db.query(
        `
        SELECT la.*, ba.* FROM loan la INNER 
        JOIN borrower_account ba ON la.borrower_id = 
        ba.borrower_id 
        where la.loan_id = ?
  
           `,
        [loanId]
      );

      let loanDetails = rows1[0];

      const { first_name, last_name, contact_number, loan_amount } =
        loanDetails;

      function formatPhoneNumber(phoneNumber) {
        // Remove any non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Check if the number starts with '09' or any other prefix and always convert to '+63'
        if (cleaned.startsWith('9')) {
          cleaned = '+63' + cleaned.substring(1); // Replace '0' or '9' with '+63'
        } else if (cleaned.startsWith('0')) {
          cleaned = '+63' + cleaned.substring(1); // Replace '0' with '+63'
        }

        // Ensure the number has the correct length after conversion
        if (cleaned.length === 13) {
          return cleaned; // Return the correctly formatted number
        } else {
          return 'Invalid phone number length';
        }
      }

      // console.log(formatPhoneNumber(contact_number));
      await sendMessage({
        firstName: first_name,
        lastName: last_name,
        phoneNumber: formatPhoneNumber(contact_number),
        messageType: 'loanCreation',
        additionalData: { loanId: loanId, loanAmount: loan_amount }
      });

      res.status(201).json({
        success: true,
        message: 'Loan application created successfully',
        data: {
          loan_application_id
        }
      });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        success: false,
        message:
          'An error occurred while creating the loan application. Please try again later.'
      });
    }
  }
);

// Route to handle file uploads
router.post(
  '/upload-files',
  upload.fields([
    { name: 'bankStatement', maxCount: 1 },
    { name: 'borrowerValidID', maxCount: 1 },
    { name: 'coMakersValidID', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files;

      const loan_application_id = req.body.loan_application_id;

      // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `lendease/loans/${loan_application_id}/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);

        let mappedKey = {
          bankStatement: 'bank_statement',
          borrowerValidID: 'borrowers_valid_id',
          coMakersValidID: 'co_makers_valid_id'
        };

        await db.query(
          `
          UPDATE loan SET ${mappedKey[key]} = ?
          where loan_application_id = ?
          
          `,
          [downloadURL, loan_application_id]
        );

        // console.log({ downloadURL });
        console.log(`${key} uploaded successfully.`);
      }

      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

router.post('/list', authenticateUserMiddleware, async (req, res) => {
  let { user_id } = req.user;

  try {
    let borrower_id = await getBorrowerAccountByUserAccountId(user_id);

    console.log({ borrower_id });
    const [rows] = await db.query(
      `


      SELECT la.*, ba.* FROM loan la INNER 
      JOIN borrower_account ba ON la.borrower_id = 
      ba.borrower_id WHERE la.borrower_id  = ? 

      ORDER BY la.application_date DESC

         
         
         
         `,
      [borrower_id]
    );
    res.status(200).json({ success: true, data: rows });
    // if (rows.length > 0) {
    //   res.status(200).json({ success: true, data: rows });
    // } else {
    //   res.status(404).json({ message: 'No loans found for this user.' });
    // }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching loan list with borrower details' });
  }
});

router.get('/:loanId/details', authenticateUserMiddleware, async (req, res) => {
  try {
    let loanId = req.params.loanId;
    const [rows] = await db.query(
      `


      SELECT la.*, ba.* FROM loan la INNER 
      JOIN borrower_account ba ON la.borrower_id = 
      ba.borrower_id 
 
     where la.loan_id = ?
       

         
         
         
         `,
      [loanId]
    );

    if (rows.length > 0) {
      res.status(200).json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ message: 'No loans found for this user.' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching loan list with borrower details' });
  }
});

// Create a new payment
router.post('/:loanId/payment', async (req, res) => {
  try {
    let loanId = req.params.loanId;

    const {
      loan_id,
      payment_amount,
      payment_date,
      payment_status,
      payment_method,
      reference_number,
      selectedTableRowIndex
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO payment (loan_id, payment_amount, payment_status, payment_method, reference_number,selectedTableRowIndex) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        loan_id,
        payment_amount,
        payment_status,
        payment_method,
        reference_number,
        selectedTableRowIndex
      ]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating payment' });
  }
});

router.get('/:loanId/paymentList', async (req, res) => {
  try {
    const { loanId } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM payment WHERE loan_id  = ?
      
      ORDER BY selectedTableRowIndex ASC
      `,
      [loanId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching payment' });
  }
});

router.post(
  '/payment/upload-files',
  upload.fields([{ name: 'proofOfPayment', maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files;

      const loan_application_id = req.body.loan_id;
      const selectedTableRowIndex = req.body.selectedTableRowIndex;

      console.log({ loan_application_id, selectedTableRowIndex });

      // // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `lendease/loans/${loan_application_id}/proof_of_payment/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        const downloadURL = await getDownloadURL(storageRef);
        console.log({ downloadURL });
        // let mappedKey = {
        //   bankStatement: 'bank_statement',
        //   borrowerValidID: 'borrowers_valid_id',
        //   coMakersValidID: 'co_makers_valid_id'
        // };

        await db.query(
          `
          UPDATE payment SET proof_of_payment = ?
          where loan_id  = ? 
          AND 
          selectedTableRowIndex = ? 

          `,
          [downloadURL, loan_application_id, selectedTableRowIndex]
        );

        // console.log({ downloadURL });
        console.log(`${key} uploaded successfully.`);
      }

      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ error: 'Failed to upload files.' });
    }
  }
);

export default router;
