import express from 'express';

import config from '../../config.js';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../../middleware/authMiddleware.js';

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
// twillo YCBPSCDZWYP11Z5JUD89W7DT
const loanApprovalMessage = ({
  firstName,
  lastName,
  loanAmount,
  loanId
}) => `Dear ${firstName} ${lastName},

Congratulations! Your loan application (Loan ID: ${loanId}) for the amount of ${loanAmount} has been approved. Our team will contact you with the next steps.

Thank you for choosing us!`;

const loanRejectionMessage = ({
  firstName,
  lastName,
  loanId
}) => `Dear ${firstName} ${lastName},

We regret to inform you that your loan application (Loan ID: ${loanId}) has been declined after careful review. Please contact us for further details.

Thank you for your understanding.`;

const loanAdvancePaymentMessage = ({
  firstName,
  lastName,
  dueAmount,
  dueDate
}) => `Dear ${firstName} ${lastName},

This is a reminder that your loan advance payment of ${dueAmount} is due on ${dueDate}. Please ensure timely payment to avoid penalties.

Thank you for your cooperation.`;

const loanPaymentAcceptanceMessage = ({
  firstName,
  lastName,
  paymentAmount,
  paymentDate,
  loanId
}) => `Dear ${firstName} ${lastName},

We have successfully received your payment of ${paymentAmount} for 
(Loan ID: ${loanId}) on ${paymentDate}. Thank you for your timely payment.

Best regards,
[Your Company Name]`;

const loanPaymentRejectionMessage = ({
  firstName,
  lastName,
  paymentAmount,
  reason,
  loanId
}) => `Dear ${firstName} ${lastName},

We regret to inform you that your payment of ${paymentAmount} for 
(Loan ID: ${loanId}) could not be processed. Please contact us to resolve this issue.

Thank you.`;

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
    loanApproval: loanApprovalMessage,
    loanRejection: loanRejectionMessage,
    loanAdvancePayment: loanAdvancePaymentMessage,
    loanPaymentAcceptance: loanPaymentAcceptanceMessage,
    loanPaymentRejection: loanPaymentRejectionMessage,
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

    let borrower_id = user_id;

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

      await db.query(
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

      // insert QR CODE
      await db.query(`INSERT INTO qr_code ( code, type) VALUES ( ?, ?)`, [
        loan_application_id,
        'Loan Application'
      ]);

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

      console.log({ loan_application_id });

      // Upload each file to Firebase Storage
      for (const [key, fileArray] of Object.entries(files)) {
        console.log('dex');
        const file = fileArray[0];

        const storageRef = ref(
          firebaseStorage,
          `lendease/loans/${loan_application_id}/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        // // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file.buffer, metadata);

        // // Get the file's download URL
        // const downloadURL = await getDownloadURL(storageRef);
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
  try {
    const [rows] = await db.query(
      `


      SELECT la.*, ba.* FROM loan la INNER 
      JOIN borrower_account ba ON la.borrower_id = 
      ba.borrower_id 
 

      ORDER BY la.application_date DESC

         
         
         
         `,
      []
    );

    if (rows.length > 0) {
      res.status(200).json({ success: true, data: rows });
    } else {
      res.status(404).json({ message: 'No loans found for this user.' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error fetching loan list with borrower details' });
  }
});

router.post(
  '/:loanId/updateStatus/confirmation',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      let { user_id } = req.user;
      let data = req.body;
      let loanId = req.params.loanId;

      let { loan_status, approval_date, remarks } = data;
      let loan_officer_id = user_id;

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

      console.log({ loanDetails });

      const [rows] = await db.query(
        `
        UPDATE loan 
        SET 
          loan_status = ?, 
          remarks = ?,
          loan_officer_id = ? 
        WHERE loan_application_id = ?;
        `,
        [loan_status, remarks, loan_officer_id, loanDetails.loan_application_id]
      );

      await db.query(
        `
        UPDATE loan_application 
        SET 
          status = ?
        WHERE application_id  = ?;
        `,
        [loan_status, loanDetails.loan_application_id]
      );

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
        messageType:
          loan_status === 'Approved' ? 'loanApproval' : 'loanRejection',

        additionalData: { loanId: loanId, loanAmount: loan_amount }
      });

      res.status(200).json({ success: true });

      // if (rows.length > 0) {
      //   res.status(200).json({ success: true, data: rows });
      // } else {
      //   res.status(404).json({ message: 'No loans found for this user.' });
      // }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);

router.post(
  '/:loanId/updatePaymentStatus',
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      let { user_id } = req.user;
      let data = req.body;
      let loanId = req.params.loanId;

      let { action, selectedTableRowIndex } = data;
      let loan_officer_id = user_id;

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

      const [rows] = await db.query(
        `
        UPDATE payment 
        SET 
          payment_status = ?, 
          loan_officer_id = ? 
        WHERE loan_id = ? AND  selectedTableRowIndex = ? 
        `,
        [action, user_id, loanId, selectedTableRowIndex]
      );

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

      const [rows2] = await db.query(
        `
        SELECT * from payment
        where selectedTableRowIndex = ?
  
           `,
        [selectedTableRowIndex]
      );

      const paymentDetails = rows2[0];

      let paymentAmount = paymentDetails.payment_amount;
      let paymentDate = paymentDetails.payment_date;

      await sendMessage({
        firstName: first_name,
        lastName: last_name,
        phoneNumber: formatPhoneNumber(contact_number),
        messageType:
          action === 'Approved'
            ? 'loanPaymentAcceptance'
            : 'loanPaymentRejection',

        additionalData: {
          loanId: loanId,
          loanAmount: loan_amount,
          paymentAmount,
          paymentDate
        }
      });

      res.status(200).json({ success: true });

      // if (rows.length > 0) {
      //   res.status(200).json({ success: true, data: rows });
      // } else {
      //   res.status(404).json({ message: 'No loans found for this user.' });
      // }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  }
);
export default router;
