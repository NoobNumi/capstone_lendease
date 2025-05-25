import express from "express";
import config from "../config.js";
import {
  authenticateUserMiddleware,
  auditTrailMiddleware,
} from "../middleware/authMiddleware.js";

let db = config.mySqlDriver;
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

import axios from "axios";
import multer from "multer";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});
let firebaseStorage = config.firebaseStorage;
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
const accountSid = config.accountSid; // Replace with your Twilio Account SID
const authToken = config.authToken; // Replace with your Twilio Auth Token
import twilio from "twilio"; // Use import statement for Twilio
import { Vonage } from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: config.VONAGE_apiKey,
  apiSecret: config.VONAGE_apiSecret,
});

// const loanCreationMessage = ({
//   firstName,
//   lastName,
//   loanAmount,
//   loanId,
// }) => `Dear ${firstName} ${lastName},

// Your loan application (Loan ID: ${loanId}) for the amount of ${loanAmount} has been successfully created. Our team will review your application and get back to you shortly.

// Thank you for choosing us!`;

// const loanApprovalMessage = ({
//   firstName,
//   lastName,
//   loanAmount,
//   loanId,
// }) => `Dear ${firstName} ${lastName},

// Your loan application (Loan ID: ${loanId}) for the amount of ${loanAmount} has been approved. Our team will proceed with the disbursement process.

// Thank you for choosing us!`;

// const loanRejectionMessage = ({
//   firstName,
//   lastName,
//   loanId,
// }) => `Dear ${firstName} ${lastName},

// Your loan application (Loan ID: ${loanId}) has been rejected.

// Thank you for choosing us!`;

// const loanPaymentAcceptanceMessage = ({
//   firstName,
//   lastName,
//   paymentAmount,
//   paymentDate,
// }) => `Dear ${firstName} ${lastName},

// Your payment of ${paymentAmount} has been successfully processed on ${paymentDate}.

// Thank you for your prompt payment!`;

// const loanPaymentRejectionMessage = ({
//   firstName,
//   lastName,
//   paymentAmount,
//   reason,
// }) => `Dear ${firstName} ${lastName},

// Your payment of ${paymentAmount} has been rejected.

// Reason: ${reason}

// Thank you for your prompt payment!`;

// const paymentSubmissionMessage = ({
//   firstName,
//   lastName,
//   paymentAmount,
//   referenceNumber,
//   paymentMethod,
// }) => `Dear ${firstName} ${lastName},

// Thank you for your payment of ${paymentAmount}. Your payment with reference number ${referenceNumber} via ${paymentMethod} has been received and is now being processed.

// You will receive another notification once your payment has been verified and approved.

// Thank you for your prompt payment!`;

const sendMessage = async ({
  firstName,
  lastName,
  phoneNumber,
  messageType,
  additionalData = {},
}) => {
  const client = twilio(accountSid, authToken);
  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = phoneNumber;

  const normalizedType = messageType
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();

  try {
    const [rows] = await db.execute(
      "SELECT message FROM message_templates WHERE type = ? LIMIT 1",
      [normalizedType]
    );

    if (!rows || rows.length === 0) {
      throw new Error(`No message template found for type: ${messageType}`);
    }

    let template = rows[0].message;
    const variables = { firstName, lastName, ...additionalData };

    const text = template.replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
      return variables[key] ?? `[missing ${key}]`;
    });

    console.log({ to, from, text });

    const message = await client.messages.create({
      body: text,
      from: from,
      to: to,
    });

    console.log("Message sent successfully with Twilio");
    console.log("Message SID:", message.sid);

    await db.execute(
      `INSERT INTO sms (sender, receiver, message, status) VALUES (?, ?, ?, ?)`,
      [from, to, text, "Pending"]
    );
  } catch (error) {
    console.error("Error occurred while sending message with Twilio:", error);

    try {
      await db.execute(
        `INSERT INTO sms (sender, receiver, message, status) VALUES (?, ?, ?, ?)`,
        [from, to, `Failed to send: ${error.message}`, "Failed"]
      );
    } catch (logErr) {
      console.error("Error logging failed SMS:", logErr);
    }
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
    minEmploymentYears,
  } = parameters;

  // Calculate credit score percentage
  const creditScorePercentage =
    creditScore >= minCreditScore ? 100 : (creditScore / minCreditScore) * 100;
  const creditScoreMessage =
    creditScore >= minCreditScore
      ? "Credit score meets the required threshold."
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
      ? "Income meets the required minimum."
      : `Income is below the required minimum of ${minMonthlyIncome}. (${incomePercentage.toFixed(
          2
        )}%)`;

  // Calculate loan-to-income ratio percentage
  const maxLoanAmount = monthlyIncome * 12 * maxLoanToIncomeRatio;
  const loanToIncomePercentage =
    loanAmount <= maxLoanAmount ? 100 : (maxLoanAmount / loanAmount) * 100;
  const loanToIncomeMessage =
    loanAmount <= maxLoanAmount
      ? "Loan amount is within the acceptable loan-to-income ratio."
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
      ? "Employment history meets the required duration."
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
  let approvalMessage = "Loan application approved.";

  if (overallApprovalPercentage < 100) {
    approvalMessage =
      "Loan application denied due to the following criteria not meeting the required thresholds:";
  }

  return {
    approved: overallApprovalPercentage === 100,
    message: approvalMessage,
    breakdown: {
      creditScore: {
        percentage: creditScorePercentage,
        message: creditScoreMessage,
      },
      income: {
        percentage: incomePercentage,
        message: incomeMessage,
      },
      loanToIncomeRatio: {
        percentage: loanToIncomePercentage,
        message: loanToIncomeMessage,
      },
      employmentYears: {
        percentage: employmentYearsPercentage,
        message: employmentYearsMessage,
      },
    },
    overallApprovalPercentage,
  };
};

const getBorrowerAccountByUserAccountId = async (userId) => {
  const [rows] = await db.query(
    `

SELECT borrower_id  FROM user_account WHERE user_id = ? 
      
       
       `,
    [userId]
  );

  console.log({ userId, rows });
  return rows[0].borrower_id;
};

router.post("/checkLoanApplicationApprovalRate", async (req, res) => {
  try {
    const { loan_application_id } = req.body;

    // Fetch loan application details
    const [loanDetails] = await db.query(
      `SELECT l.*, b.monthly_income, b.credit_score, b.employment_years 
       FROM loan l 
       JOIN borrower_account b ON l.borrower_id = b.borrower_id 
       WHERE l.loan_id = ?`,
      [loan_application_id]
    );

    // Fetch loan parameters
    const [parameters] = await db.query(
      `SELECT * FROM loan_setting_parameters WHERE loan_type = ?`,
      ["personal"]
    );

    const param = parameters[0];
    const loan = loanDetails[0];

    // Ensure the monthly income is a valid number
    loan.monthly_income = parseFloat(loan.employee_monthly_income_amount) || 0;

    param.min_monthly_income = parseFloat(param.min_monthly_income) || 0;
    param.loan_to_income_ratio = parseFloat(param.loan_to_income_ratio) || 0;
    param.employment_years = parseFloat(param.employment_years) || 0;
    param.min_credit_score = parseFloat(param.min_credit_score) || 0;

    // Ensure employment_years is a valid number
    const employmentYears = parseFloat(loan.employment_years) || 0;

    // Detailed calculations with explanations
    const creditScoreCalc = {
      actual: loan.credit_score,
      required: param.min_credit_score,
      percentage: Number(
        Math.min(
          (loan.credit_score / param.min_credit_score) * 100,
          100
        ).toFixed(2)
      ),
      formula: "Credit Score / Required Credit Score × 100",
      explanation: `${loan.credit_score} / ${param.min_credit_score} × 100 = ${(
        (loan.credit_score / param.min_credit_score) *
        100
      ).toFixed(2)}%`,
    };

    const incomeCalc = {
      actual: Number(loan.monthly_income.toFixed(2)),
      required: Number(param.min_monthly_income.toFixed(2)),
      percentage: Number(
        Math.min(
          (loan.monthly_income / param.min_monthly_income) * 100,
          100
        ).toFixed(2)
      ),
      formula: "Monthly Income / Required Monthly Income × 100",
      explanation: `₱${loan.monthly_income.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} / ₱${param.min_monthly_income.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} × 100 = ${(
        (loan.monthly_income / param.min_monthly_income) *
        100
      ).toFixed(2)}%`,
    };

    const loanToIncomeRatio = Number(
      ((loan.loan_amount / (loan.monthly_income * 12)) * 100).toFixed(2)
    );
    const maxAllowedRatio = Number(param.loan_to_income_ratio.toFixed(2));

    const loanToIncomeCalc = {
      required: Number(param.loan_to_income_ratio.toFixed(2)),
      actual: loanToIncomeRatio,
      maximum: maxAllowedRatio,
      percentage: Number(
        Math.min(
          ((maxAllowedRatio - loanToIncomeRatio) / maxAllowedRatio) * 100,
          100
        ).toFixed(2)
      ),
      formula: "((Maximum Ratio - Actual Ratio) / Maximum Ratio) × 100",
      explanation: `Loan Amount: ₱${loan.loan_amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}\nAnnual Income: ₱${(loan.monthly_income * 12).toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}\nActual Ratio: ${loanToIncomeRatio.toFixed(
        2
      )}%\nMax Allowed: ${maxAllowedRatio.toFixed(2)}%`,
    };

    const employmentCalc = {
      actual: employmentYears.toFixed(2), // Use .toFixed() after ensuring it's a number
      required: param.employment_years.toFixed(2),
      percentage: Math.min(
        (employmentYears / param.employment_years) * 100,
        100
      ).toFixed(2),
      formula: "Employment Years / Required Years × 100",
      explanation: `${employmentYears} years / ${
        param.employment_years
      } years × 100 = ${(
        (employmentYears / param.employment_years) *
        100
      ).toFixed(2)}%`,
    };

    // Calculate overall percentage with weightage
    const weights = {
      creditScore: 0.3,
      income: 0.25,
      loanToIncome: 0.25,
      employment: 0.2,
    };

    const overallPercentage =
      creditScoreCalc.percentage * weights.creditScore +
      incomeCalc.percentage * weights.income +
      loanToIncomeCalc.percentage * weights.loanToIncome +
      employmentCalc.percentage * weights.employment;

    const approved = overallPercentage >= 70;

    const response = {
      approved,
      overallApprovalPercentage: overallPercentage,
      message: approved
        ? "Loan application meets all required criteria"
        : "Loan application needs improvement in some areas",
      breakdown: {
        creditScore: {
          ...creditScoreCalc,
          weight: `${weights.creditScore * 100}%`,
          weightedScore: (
            creditScoreCalc.percentage * weights.creditScore
          ).toFixed(2),
        },
        income: {
          ...incomeCalc,
          weight: `${weights.income * 100}%`,
          weightedScore: (incomeCalc.percentage * weights.income).toFixed(2),
        },
        loanToIncome: {
          ...loanToIncomeCalc,
          weight: `${weights.loanToIncome * 100}%`,
          weightedScore: (
            loanToIncomeCalc.percentage * weights.loanToIncome
          ).toFixed(2),
        },
        employment: {
          ...employmentCalc,
          weight: `${weights.employment * 100}%`,
          weightedScore: (
            employmentCalc.percentage * weights.employment
          ).toFixed(2),
        },
      },
    };

    res.json({
      success: true,
      data: { result: response },
    });
  } catch (error) {
    console.error("Error in loan evaluation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to evaluate loan application",
    });
  }
});

router.post(
  "/create",
  authenticateUserMiddleware,

  async (req, res) => {
    const data = req.body;

    const {
      proposed_loan_amount,
      loan_type,
      loan_type_specific,
      calculatorLoanAmmount,
      calculatorInterestRate,
      calculatorMonthsToPay,

      work_name,
      has_business,
      type_of_business,

      disbursement_type, // The type of disbursement
      disbursement_bank_or_wallet_name, // The bank or e-wallet name
      disbursement_account_name, // The account holder's name
      disbursement_account_number, // The account number

      business_address,
      income_flow,
      income_amount,
      numberField,
      loan_security,
      relationship_to_loan_guarantor,
      loan_guarantor,
      employee_monthly_income_amount,
      employment_years,
    } = data;

    let { user_id } = req.user;
    // console.log({ data });

    console.log({ user_id });
    let borrower_id = await getBorrowerAccountByUserAccountId(user_id);
    // map to db
    let loan_application_id = uuidv4();
    let loan_amount_val = calculatorLoanAmmount || proposed_loan_amount;
    let repayment_schedule_id = calculatorMonthsToPay;
    let loan_type_value = loan_type || loan_type_specific;
    let interest_rate = calculatorInterestRate;
    let loan_status = "Pending";
    let purpose = loan_type_specific;
    let remarks = "";

    try {
      await db.query(
        `INSERT INTO loan_application (application_id, borrower_id, loan_amount, status, qr_code_id)
       VALUES (?, ?, ?, ?, ?)`,
        [loan_application_id, borrower_id, loan_amount_val, loan_status, 1]
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
       repayment_schedule_id,
       employee_monthly_income_amount
       
       ) 
       VALUES ( ?, ?, ?, ?, ? ,?, ?,?, ?, ? )`,
        [
          loan_application_id,
          borrower_id,
          loan_type_value,
          loan_amount_val,
          interest_rate,
          loan_status,
          purpose,
          remarks,
          repayment_schedule_id,
          employee_monthly_income_amount || income_amount,
        ]
      );

      const loanId = result.insertId;

      let mappedKey = {
        work_name: "non_employee_work_name",
        has_business: "non_employee_has_business",
        type_of_business: "non_employee_type_of_business",
        disbursement_type: "disbursement_type",
        disbursement_bank_or_wallet_name: "disbursement_bank_or_wallet_name",
        disbursement_account_name: "disbursement_account_name",
        disbursement_account_number: "disbursement_account_number",
        business_address: "non_employee_business_address",
        income_flow: "non_employee_income_flow",
        income_amount: "non_employee_income_amount",
        numberField: "non_employee_numberField",
        loan_security: "non_employee_loan_security",
        relationship_to_loan_guarantor:
          "non_employee_relationship_to_loan_guarantor",
        loan_guarantor: "non_employee_loan_guarantor",
      };

      await db.query(
        `
        UPDATE borrower_account SET 
            employment_years = ?,
            monthly_income = ?

            where borrower_id  = ?
        `,
        [
          employment_years || 1,
          employee_monthly_income_amount || income_amount,
          borrower_id,
        ]
      );

      await db.query(
        `
        UPDATE loan SET 
            ${mappedKey.work_name} = ?, 
            ${mappedKey.has_business} = ?, 
            ${mappedKey.type_of_business} = ?, 
            ${mappedKey.disbursement_type} = ?, 
            ${mappedKey.disbursement_bank_or_wallet_name} = ?, 
            ${mappedKey.disbursement_account_name} = ?, 
            ${mappedKey.disbursement_account_number} = ?, 
            ${mappedKey.business_address} = ?, 
            ${mappedKey.income_flow} = ?, 
            ${mappedKey.income_amount} = ?, 
            ${mappedKey.numberField} = ?, 
            ${mappedKey.loan_security} = ?, 
            ${mappedKey.relationship_to_loan_guarantor} = ?, 
            ${mappedKey.loan_guarantor} = ? 
        WHERE loan_id = ?
        `,
        [
          work_name,
          has_business,
          type_of_business,
          disbursement_type,
          disbursement_bank_or_wallet_name,
          disbursement_account_name,
          disbursement_account_number,
          business_address,
          income_flow,
          income_amount,
          numberField,
          loan_security,
          relationship_to_loan_guarantor,
          loan_guarantor,
          loanId, // This is the last parameter
        ]
      );

      // insert QR CODE
      await db.query(`INSERT INTO qr_code ( code, type) VALUES ( ?, ?)`, [
        loan_application_id,
        "Loan Application",
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

      console.log({ loanId, rows1 });
      let loanDetails = rows1[0];

      console.log({ loanDetails });
      let { first_name, last_name, contact_number, loan_amount } = loanDetails;

      function formatPhoneNumber(phoneNumber) {
        // Remove any non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, "");

        // Check if the number starts with '09' or any other prefix and always convert to '+63'
        if (cleaned.startsWith("9")) {
          cleaned = "+63" + cleaned.substring(1); // Replace '0' or '9' with '+63'
        } else if (cleaned.startsWith("0")) {
          cleaned = "+63" + cleaned.substring(1); // Replace '0' with '+63'
        }

        // Ensure the number has the correct length after conversion
        if (cleaned.length === 13) {
          return cleaned; // Return the correctly formatted number
        } else {
          return "Invalid phone number length";
        }
      }

      // console.log(formatPhoneNumber(contact_number));
      await sendMessage({
        firstName: first_name,
        lastName: last_name,
        phoneNumber: formatPhoneNumber(contact_number),
        messageType: "loanCreation",
        additionalData: { loanId: loanId, loanAmount: loan_amount },
      });

      res.status(201).json({
        success: true,
        message: "Loan application created successfully",
        data: {
          loan_application_id,
        },
      });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({
        success: false,
        message:
          "An error occurred while creating the loan application. Please try again later.",
      });
    }
  }
);

// Route to handle file uploads
router.post(
  "/payments/upload-files",
  upload.fields([{ name: "proofOfPayment", maxCount: 1 }]),
  async (req, res) => {
    try {
      const files = req.files;
      const loan_id = req.body.loan_id;
      const selectedTableRowIndex = req.body.selectedTableRowIndex;

      for (const [key, fileArray] of Object.entries(files)) {
        const file = fileArray[0];
        const storageRef = ref(
          firebaseStorage,
          `lendease/loans/${loan_id}/payments/${selectedTableRowIndex}/${file.originalname}`
        );
        const metadata = { contentType: file.mimetype };

        await uploadBytes(storageRef, file.buffer, metadata);
        const downloadURL = await getDownloadURL(storageRef);

        await db.query(
          `UPDATE payment 
           SET proof_of_payment = ?
           WHERE loan_id = ? AND selectedTableRowIndex = ?`,
          [downloadURL, loan_id, selectedTableRowIndex]
        );
      }

      res.status(200).json({ message: "Files uploaded successfully!" });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files." });
    }
  }
);

router.post("/list", authenticateUserMiddleware, async (req, res) => {
  let { user_id, role } = req.user;

  console.log({ role });

  try {
    let borrower_id = await getBorrowerAccountByUserAccountId(user_id);

    console.log({ borrower_id });
    const [rows] = await db.query(
      `


      SELECT la.*, ba.*, dd.* , la.loan_id as loan_id  FROM loan la INNER 
      JOIN borrower_account ba ON la.borrower_id = 
      ba.borrower_id 
      
      LEFT  JOIN disbursement_details dd ON la.loan_id = dd.loan_id
      

      ${role === "Borrower" ? " WHERE la.borrower_id  = ?" : ""}


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
      .json({ error: "Error fetching loan list with borrower details" });
  }
});

router.get("/:loanId/details", async (req, res) => {
  try {
    let loanId = req.params.loanId;
    const [rows] = await db.query(
      `


      SELECT la.*, ba.* ,dd.* , la.loan_id as loan_id FROM loan la INNER 
      JOIN borrower_account ba ON la.borrower_id = 
      ba.borrower_id 
 
         LEFT  JOIN disbursement_details dd ON la.loan_id = dd.loan_id
         
     where la.loan_id = ?
       

         
         
         
         `,
      [loanId]
    );

    if (rows.length > 0) {
      res.status(200).json({ success: true, data: rows[0] });
    } else {
      res.status(404).json({ message: "No loans found for this user." });
    }
  } catch (error) {
    console.log({ error });
    res
      .status(500)
      .json({ error: "Error fetching loan list with borrower details" });
  }
});

// Create a new payment
router.post("/:loanId/payment", async (req, res) => {
  try {
    let loanId = req.params.loanId;

    const {
      loan_id,
      payment_amount,
      payment_date,
      payment_status,
      payment_method,
      reference_number,
      selectedTableRowIndex,
      includes_past_due,
      past_due_amount,
      original_amount,
    } = req.body;

    // Insert payment with additional fields
    const [result] = await db.query(
      `INSERT INTO payment (
        loan_id, 
        payment_amount, 
        payment_date,
        payment_status, 
        payment_method, 
        reference_number,
        selectedTableRowIndex,
        includes_past_due,
        past_due_amount,
        original_amount,
        approval_or_rejected_date
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        loan_id,
        payment_amount,
        payment_date,
        payment_status,
        payment_method,
        reference_number,
        selectedTableRowIndex,
        includes_past_due || false,
        past_due_amount || 0,
        original_amount || payment_amount,
      ]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating payment" });
  }
});

// Get payment list with enhanced details
router.get("/:loanId/paymentList", async (req, res) => {
  try {
    const { loanId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        p.*,
        CASE 
          WHEN p.payment_status = 'Approved' THEN true
          WHEN p.payment_status = 'Pending' THEN true
          ELSE false
        END as is_paid,
        CASE 
          WHEN p.includes_past_due = 1 THEN true
          ELSE false
        END as includes_past_due,
        COALESCE(p.original_amount, p.payment_amount) as original_amount,
        COALESCE(p.past_due_amount, 0) as past_due_amount,
        p.approval_or_rejected_date
      FROM payment p 
      WHERE p.loan_id = ?
      ORDER BY p.selectedTableRowIndex ASC`,
      [loanId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching payment list" });
  }
});

// Update payment status route
router.post("/:loanId/updatePaymentStatus", async (req, res) => {
  try {
    const { loanId } = req.params;
    let { action, remarks, selectedTableRowIndex } = req.body;
    selectedTableRowIndex = 1;
    // Update payment status and approval/rejection date
    await db.query(
      `UPDATE payment 
       SET 
         payment_status = ?,
         approval_or_rejected_date = NOW(),
         loan_officer_id = ?,
         remarks = ?
       WHERE loan_id = ? AND selectedTableRowIndex = ?`,
      [action, req.user?.officer_id, remarks, loanId, selectedTableRowIndex]
    );

    // If payment is approved, handle past due updates
    if (action === "Approved") {
      const [paymentRecord] = await db.query(
        `SELECT * FROM payment 
         WHERE loan_id = ? AND selectedTableRowIndex = ?`,
        [loanId, selectedTableRowIndex]
      );

      console.log({ paymentRecord, loanId, selectedTableRowIndex });
      if (paymentRecord[0]?.includes_past_due) {
        await db.query(
          `UPDATE payment 
           SET past_due_handled = true,
               past_due_handled_date = NOW()
           WHERE loan_id = ? AND selectedTableRowIndex = ?`,
          [loanId, selectedTableRowIndex]
        );
      }

      // Send notification to borrower
      const [loanDetails] = await db.query(
        `SELECT b.contact_number, b.first_name 
         FROM loan l 
         JOIN borrower_account b ON l.borrower_id = b.borrower_id 
         WHERE l.loan_id = ?`,
        [loanId]
      );

      if (loanDetails[0]) {
        await sendMessage({
          firstName: loanDetails[0].first_name,
          phoneNumber: loanDetails[0].contact_number,
          messageType: "paymentApproved",
          additionalData: {
            paymentAmount: paymentRecord[0].payment_amount,
            referenceNumber: paymentRecord[0].reference_number,
          },
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating payment status" });
  }
});

// New endpoint to handle payment submission with file upload
router.post(
  "/:loanId/submit-payment",
  upload.single("proof_of_payment"),
  async (req, res) => {
    try {
      const {
        payment_amount,
        payment_method,
        reference_number,
        selectedTableRowIndex,
        includes_past_due,
        past_due_amount,
        original_amount,
        remarks,
      } = req.body;

      // Insert payment record
      const [result] = await db.query(
        `INSERT INTO payment (
        loan_id,
        payment_amount,
        payment_method,
        reference_number,
        selectedTableRowIndex,
        proof_of_payment,
        payment_status,
        includes_past_due,
        past_due_amount,
        original_amount,
        remarks,
        past_due_handled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.params.loanId,
          payment_amount,
          payment_method,
          reference_number,
          selectedTableRowIndex,
          req.file?.filename || null,
          "Pending",
          includes_past_due === "1",
          past_due_amount || 0,
          original_amount,
          remarks,
          includes_past_due === "1", // Mark as handled if it includes past due
        ]
      );

      // If payment includes past due, update previous unpaid payments
      if (includes_past_due === "1") {
        await db.query(
          `UPDATE payment   
         SET past_due_handled = 1,
             past_due_handled_date = CURRENT_TIMESTAMP,
             remarks = CONCAT(remarks, ' (Handled in payment ID: ${result.insertId})')
         WHERE loan_id = ? 
         AND payment_status = 'Pending'
         AND selectedTableRowIndex < ?`,
          [req.params.loanId, selectedTableRowIndex]
        );
      }

      // Fetch borrower details to send SMS notification
      const [loanDetails] = await db.query(
        `SELECT l.*, b.first_name, b.last_name, b.contact_number 
         FROM loan l 
         JOIN borrower_account b ON l.borrower_id = b.borrower_id 
         WHERE l.loan_id = ?`,
        [req.params.loanId]
      );

      if (loanDetails.length > 0) {
        const { first_name, last_name, contact_number } = loanDetails[0];

        function formatPhoneNumber(phoneNumber) {
          // Remove any non-digit characters
          let cleaned = phoneNumber.replace(/\D/g, "");

          // Check if the number starts with '09' or any other prefix and always convert to '+63'
          if (cleaned.startsWith("9")) {
            cleaned = "+63" + cleaned.substring(1); // Replace '9' with '+63'
          } else if (cleaned.startsWith("0")) {
            cleaned = "+63" + cleaned.substring(1); // Replace '0' with '+63'
          }

          // Ensure the number has the correct length after conversion
          if (cleaned.length === 13) {
            return cleaned; // Return the correctly formatted number
          } else {
            return "Invalid phone number length";
          }
        }

        // Send payment submission notification
        await sendMessage({
          firstName: first_name,
          lastName: last_name,
          phoneNumber: formatPhoneNumber(contact_number),
          messageType: "paymentSubmission",
          additionalData: {
            paymentAmount: payment_amount,
            referenceNumber: reference_number,
            paymentMethod: payment_method,
          },
        });

        console.log("Payment submission notification sent successfully");
      }

      res.json({
        success: true,
        message: "Payment submitted successfully",
        paymentId: result.insertId,
      });
    } catch (error) {
      console.error("Payment submission error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit payment",
        error: error.message,
      });
    } finally {
    }
  }
);

// Get all payments for a loan
router.get("/:loanId/payments", async (req, res) => {
  try {
    const { loanId } = req.params;

    const query = `
      SELECT * FROM payment 
      WHERE loan_id = ? 
      ORDER BY selectedTableRowIndex ASC
    `;

    const [rows] = await db.query(query, [loanId]);
    res.json(rows);
  } catch (error) {
    console.error("Error in GET /payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get payment details
router.get("/:loanId/payments/:paymentId", async (req, res) => {
  try {
    const { loanId, paymentId } = req.params;

    const query = `
      SELECT 
        p.*,
        DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i:%s') as formatted_payment_date
      FROM payment p
      WHERE p.loan_id = ? AND p.payment_id = ?
    `;

    const [rows] = await db.query(query, [loanId, paymentId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error in GET /payments/:paymentId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update payment status (for admin/officer approval)
router.post(
  "/payments/:paymentId/status",
  authenticateUserMiddleware,
  async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { status, remarks, loanId } = req.body;
      const userId = req.user.id; // From auth middleware

      // Validate status
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const query = `
      UPDATE payment 
      SET 
        payment_status = ?,
        loan_officer_id = ?,
        remarks = ?,
        approval_or_rejected_date = NOW()
      WHERE payment_id = ? AND loan_id = ?
    `;

      const [result] = await db.query(query, [
        status,
        userId,
        remarks,
        paymentId,
        loanId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Payment not found" });
      }

      res.json({
        message: `Payment ${status.toLowerCase()} successfully`,
        status: status,
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update the test endpoint to support testing different message types
router.get("/test-message/:messageType?", async (req, res) => {
  try {
    function formatPhoneNumber(phoneNumber) {
      // Remove any non-digit characters
      let cleaned = phoneNumber.replace(/\D/g, "");

      // Check if the number starts with '09' or any other prefix and always convert to '+63'
      if (cleaned.startsWith("9")) {
        cleaned = "+63" + cleaned.substring(1); // Replace '0' or '9' with '+63'
      } else if (cleaned.startsWith("0")) {
        cleaned = "+63" + cleaned.substring(1); // Replace '0' with '+63'
      }

      // Ensure the number has the correct length after conversion
      if (cleaned.length === 13) {
        return cleaned; // Return the correctly formatted number
      } else {
        return "Invalid phone number length";
      }
    }

    // Get the message type from the URL parameter, default to 'loanCreation'
    const messageType = req.params.messageType || "loanCreation";

    // Set up testing data for different message types
    const testData = {
      firstName: "Test",
      lastName: "User",
      phoneNumber: formatPhoneNumber("09923150633"), // Replace with your test phone number
      messageType: messageType,
      additionalData: {},
    };

    // Add specific data for each message type
    switch (messageType) {
      case "loanCreation":
        testData.additionalData = { loanId: "TEST123", loanAmount: "10,000" };
        break;
      case "loanApproval":
        testData.additionalData = { loanId: "TEST123", loanAmount: "10,000" };
        break;
      case "loanRejection":
        testData.additionalData = { loanId: "TEST123" };
        break;
      case "loanDisbursement":
        testData.additionalData = {
          loanId: "TEST123",
          loanAmount: "10,000",
          paymentMethod: "Bank Transfer",
          paymentChannel: "BDO",
        };
        break;
      case "paymentSubmission":
        testData.additionalData = {
          paymentAmount: "1,500",
          referenceNumber: "REF12345",
          paymentMethod: "GCash",
        };
        break;
      case "loanPaymentAcceptance":
        testData.additionalData = {
          loanId: "TEST123",
          paymentAmount: "1,500",
          paymentDate: "2023-07-15",
        };
        break;
      case "loanPaymentRejection":
        testData.additionalData = {
          loanId: "TEST123",
          paymentAmount: "1,500",
          reason: "Invalid reference number",
        };
        break;
      default:
        return res.status(400).json({ error: "Invalid message type" });
    }

    // Send the test message
    await sendMessage(testData);

    res.json({
      success: true,
      message: `Test ${messageType} message sent successfully`,
      details: testData,
    });
  } catch (error) {
    console.error("Error sending test message:", error);
    res.status(500).json({ error: "Failed to send test message" });
  }
});

// Replace Paymongo config with Xendit config
const XENDIT_SECRET_KEY = config.XENDIT_SECRET_KEY;

const XENDIT_PUBLIC_KEY =
  "xnd_public_development_Q_gN2p8xdj6WLTSZwzr5ApG9i0ASvbFVaEluXbxHUs7Ud6l5ScmDXxETSJ80oZuH";
const XENDIT_API_URL = config.XENDIT_API_URL;

// Create a payment using Xendit
router.post("/create-payment", async (req, res) => {
  try {
    const { loanId, paymentAmount, paymentIndex, description } = req.body;

    if (!loanId || !paymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Get loan details to include in payment metadata
    const [loanDetails] = await db.query(
      "SELECT loan_application_id, borrower_id FROM loan WHERE loan_id = ?",
      [loanId]
    );

    if (!loanDetails.length) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    // Create short unique payment reference (~13 characters)
    const shortRef = `LOAN-${Date.now().toString(36)}${Math.random()
      .toString(36)
      .substr(2, 3)}`;

    console.log({ loanDetails });
    // Create Xendit invoice
    const invoice = await axios.post(
      `${XENDIT_API_URL}/v2/invoices`,
      {
        external_id: shortRef,
        amount: paymentAmount,
        payer_email: "borrower@email.com",
        description:
          description ||
          `Loan Payment for ${loanDetails[0].loan_application_id}`,
        invoice_duration: 86400, // 24 hours in seconds
        success_redirect_url: `${config.REACT_FRONT_END_URL}/app/loan_details/${loanId}?payment=success&reference=${shortRef}`,
        failure_redirect_url: `${config.REACT_FRONT_END_URL}/app/loan_details/${loanId}?payment=failed&reference=${shortRef}`,
        currency: "PHP",
        items: [
          {
            name: `Loan Payment - Month ${paymentIndex}`,
            quantity: 1,
            price: paymentAmount,
            category: "Loan Payment",
          },
        ],
        fees: [
          {
            type: "Interest",
            value: 0, // No additional fees
          },
        ],
        payment_methods: [
          "CREDIT_CARD",
          "GCASH",
          "PAYMAYA",
          "7ELEVEN",
          "CEBUANA",
        ],
        customer: {
          given_names: "Borrower",
          surname: "Name",
          email: "borrower@email.com",
          mobile_number: "+639123456789",
        },
        customer_notification_preference: {
          invoice_created: ["email", "sms"],
          invoice_reminder: ["email", "sms"],
          invoice_paid: ["email", "sms"],
          invoice_expired: ["email"],
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Record payment attempt in database
    await db.query(
      `INSERT INTO payment_attempts (loan_id, payment_index, amount, reference, payment_intent_id, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 'completed', NOW())`,
      [loanId, paymentIndex, paymentAmount, shortRef, invoice.data.id]
    );

    // Return payment information to client
    res.json({
      success: true,
      invoice: invoice.data,
      reference: shortRef,
    });
  } catch (error) {
    console.error(
      "Error creating Xendit payment:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
});

// Handle Xendit webhook for payment status updates
router.post("/xendit-webhook", async (req, res) => {
  try {
    console.log("Xendit webhook received:", req.body);

    const xenditHeader = req.headers["x-callback-token"];
    if (xenditHeader !== config.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body;

    // For paid invoices
    if (event.status === "PAID") {
      // Extract the external_id which contains our reference
      const externalId = event.external_id;

      // Update payment_attempts status
      await db.query(
        `UPDATE payment_attempts SET status = 'completed', completed_at = NOW() 
         WHERE reference = ?`,
        [externalId]
      );

      // Parse the loan_id and payment_index from the external_id
      // Format: LOAN-{loan_application_id}-{paymentIndex}-{timestamp}
      const parts = externalId.split("-");
      const loanApplicationId = parts[1];
      const selectedTableRowIndex = parseInt(parts[2]);

      // Get loan_id from loan_application_id
      const [loanInfo] = await db.query(
        `SELECT loan_id FROM loan WHERE loan_application_id = ?`,
        [loanApplicationId]
      );

      if (loanInfo.length > 0) {
        // Check if payment record already exists
        const [existingPayment] = await db.query(
          `SELECT payment_id FROM payment WHERE loan_id = ? AND reference_number = ?`,
          [loanInfo[0].loan_id, externalId]
        );

        if (!existingPayment.length) {
          // Get loan payment details to check if this is a past due payment
          const [paymentDetails] = await db.query(
            `SELECT 
              is_past_due, 
              original_amount,
              past_due_amount 
             FROM loan_payment_schedule 
             WHERE loan_id = ? AND payment_index = ?`,
            [loanInfo[0].loan_id, selectedTableRowIndex]
          );

          const isPastDue =
            paymentDetails.length > 0 && paymentDetails[0].is_past_due === 1;
          const originalAmount =
            paymentDetails.length > 0
              ? paymentDetails[0].original_amount
              : event.amount;
          const pastDueAmount =
            paymentDetails.length > 0 ? paymentDetails[0].past_due_amount : 0;

          // Insert payment record with the correct schema
          await db.query(
            `INSERT INTO payment 
             (loan_id, payment_amount, payment_date, payment_method, reference_number, 
              payment_status, selectedTableRowIndex, proof_of_payment, includes_past_due,
              past_due_amount, original_amount, past_due_handled, remarks) 
             VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              loanInfo[0].loan_id,
              event.amount,
              event.payment_method || "Xendit",
              externalId,
              "Approved",
              selectedTableRowIndex,
              JSON.stringify(event), // Store the Xendit response as proof
              isPastDue ? 1 : 0,
              pastDueAmount,
              originalAmount,
              isPastDue ? 1 : 0, // Mark past due as handled if this was a past due payment
              `Payment received via Xendit (${
                event.payment_channel || "Online Payment"
              })`,
            ]
          );

          // Send notification to borrower about successful payment
          try {
            const [borrowerInfo] = await db.query(
              `SELECT u.first_name, u.last_name, u.contact_number 
               FROM users u JOIN loan l ON u.user_id = l.borrower_id 
               WHERE l.loan_id = ?`,
              [loanInfo[0].loan_id]
            );

            if (borrowerInfo.length > 0) {
              // Send SMS notification
              await sendMessage({
                recipient: borrowerInfo[0].contact_number,
                message: loanPaymentAcceptanceMessage({
                  firstName: borrowerInfo[0].first_name,
                  lastName: borrowerInfo[0].last_name,
                  paymentAmount: event.amount,
                  paymentDate: new Date().toLocaleDateString(),
                }),
              });
            }
          } catch (notificationError) {
            console.error(
              "Error sending payment notification:",
              notificationError
            );
            // Continue execution - don't fail the webhook because of notification
          }
        }
      }
    }

    // For expired invoices
    if (event.status === "EXPIRED") {
      await db.query(
        `UPDATE payment_attempts SET status = 'failed', error_message = 'Invoice expired', completed_at = NOW() 
         WHERE reference = ?`,
        [event.external_id]
      );
    }

    res.status(200).end();
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(400).end();
  }
});

// Update the payment-status endpoint
router.get("/payment-status/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    // First check local status in payment_attempts
    const [paymentStatus] = await db.query(
      `SELECT status, payment_intent_id, error_message FROM payment_attempts
       WHERE reference = ?`,
      [reference]
    );

    // Also check if we already have a payment record
    const [existingPayment] = await db.query(
      `SELECT payment_id, payment_status FROM payment WHERE reference_number = ?`,
      [reference]
    );

    if (existingPayment.length > 0) {
      // We already have a payment record, return its status
      return res.json({
        success: true,
        status:
          existingPayment[0].payment_status === "Approved"
            ? "completed"
            : "failed",
        paymentId: existingPayment[0].payment_id,
      });
    }

    if (paymentStatus.length > 0) {
      // If we don't have a payment record but have a payment attempt, check with Xendit
      if (
        paymentStatus[0].status === "pending" ||
        paymentStatus[0].status === "completed"
      ) {
        try {
          const xenditResponse = await axios.get(
            `${config.XENDIT_API_URL}/v2/invoices/${paymentStatus[0].payment_intent_id}`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(
                  config.XENDIT_SECRET_KEY + ":"
                ).toString("base64")}`,
                "Content-Type": "application/json",
              },
            }
          );

          let newStatus = paymentStatus[0].status;

          if (xenditResponse.data.status === "PAID") {
            // Mark as completed if not already
            if (newStatus !== "completed") {
              newStatus = "completed";
              await db.query(
                `UPDATE payment_attempts SET status = 'completed', completed_at = NOW() WHERE reference = ?`,
                [reference]
              );
            }

            // Check if we need to insert a payment record
            if (existingPayment.length === 0) {
              // Parse the loan_id and payment_index from the external_id
              let parts = xenditResponse.data.external_id.split("-");

              // Get loan_id - try both simple and complex formats
              const potentialLoanAppId = parts[1]; // Simple format
              const complexLoanAppId = xenditResponse.data.external_id
                .split("-")
                .slice(1, 6)
                .join("-"); // Complex format

              console.log({ potentialLoanAppId, complexLoanAppId });
              // First try the simple format
              let [loanInfo] = await db.query(
                `SELECT loan_id FROM loan WHERE loan_application_id = ?`,
                [potentialLoanAppId]
              );

              // If no results, try the complex format
              if (loanInfo.length === 0) {
                [loanInfo] = await db.query(
                  `SELECT loan_id FROM loan WHERE loan_application_id = ?`,
                  [complexLoanAppId]
                );
              }

              if (loanInfo.length > 0) {
                let loanId = loanInfo[0].loan_id;
                let selectedTableRowIndex = parseInt(parts[parts.length - 1]);

                console.log({ selectedTableRowIndex });
                // Default values for payment details
                const isPastDue = false;
                const originalAmount = xenditResponse.data.amount;
                const pastDueAmount = 0;

                // Insert the payment
                await db.query(
                  `INSERT INTO payment 
                   (loan_id, payment_amount, payment_date, payment_method, reference_number, 
                    payment_status, selectedTableRowIndex, proof_of_payment, includes_past_due,
                    past_due_amount, original_amount, past_due_handled, remarks) 
                   VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    loanId,
                    xenditResponse.data.amount,
                    xenditResponse.data.payment_method || "Xendit",
                    reference,
                    "Approved",
                    selectedTableRowIndex,
                    JSON.stringify(xenditResponse.data), // Store the Xendit response as proof
                    isPastDue ? 1 : 0,
                    pastDueAmount,
                    originalAmount,
                    isPastDue ? 1 : 0, // Mark past due as handled if this was a past due payment
                    `Payment received via Xendit (${
                      xenditResponse.data.payment_channel || "Online Payment"
                    })`,
                  ]
                );
              }
            }
          } else if (xenditResponse.data.status === "EXPIRED") {
            newStatus = "failed";
            await db.query(
              `UPDATE payment_attempts SET status = 'failed', error_message = 'Invoice expired', completed_at = NOW() WHERE reference = ?`,
              [reference]
            );
          }

          return res.json({
            success: true,
            status: newStatus,
            xenditStatus: xenditResponse.data.status,
            error:
              newStatus === "failed" ? "Payment expired or canceled" : null,
          });
        } catch (xenditError) {
          console.error("Error checking with Xendit:", xenditError);
          // Continue with local status if Xendit request fails
        }
      }

      // Return the local status
      res.json({
        success: true,
        status: paymentStatus[0].status,
        error: paymentStatus[0].error_message || null,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Payment reference not found",
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
    });
  }
});

// Manual webhook trigger for cases when Xendit's webhook doesn't reach us
router.post("/manual-process-payment/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    console.log("Manual processing payment with reference:", reference);

    // Check if payment is already processed
    const [existingPayment] = await db.query(
      `SELECT payment_id FROM payment WHERE reference_number = ?`,
      [reference]
    );

    console.log("Existing payment check:", existingPayment);

    if (existingPayment.length > 0) {
      return res.json({
        success: true,
        message: "Payment already processed",
        paymentId: existingPayment[0].payment_id,
      });
    }

    // Get payment attempt info
    const [paymentAttempt] = await db.query(
      `SELECT payment_intent_id, status, loan_id, payment_index FROM payment_attempts 
       WHERE reference = ?`,
      [reference]
    );

    console.log("Payment attempt data:", paymentAttempt);

    if (!paymentAttempt.length) {
      return res.status(404).json({
        success: false,
        message: "Payment attempt not found",
      });
    }

    // If payment is already marked as completed in attempts, but not in payments table
    if (paymentAttempt[0].status === "completed") {
      try {
        // Get payment info from Xendit
        console.log(
          "Fetching payment info from Xendit for:",
          paymentAttempt[0].payment_intent_id
        );
        const xenditResponse = await axios.get(
          `${config.XENDIT_API_URL}/v2/invoices/${paymentAttempt[0].payment_intent_id}`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(
                config.XENDIT_SECRET_KEY + ":"
              ).toString("base64")}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Xendit response:", {
          status: xenditResponse.data.status,
          external_id: xenditResponse.data.external_id,
          amount: xenditResponse.data.amount,
        });

        // Only process if paid
        if (xenditResponse.data.status === "PAID") {
          // Get loan_id directly from payment_attempts if available
          let loanId = paymentAttempt[0].loan_id;
          let selectedTableRowIndex = paymentAttempt[0].payment_index;

          // If not available in payment_attempts, parse from external_id
          if (!loanId || !selectedTableRowIndex) {
            const parts = xenditResponse.data.external_id.split("-");
            console.log("External ID parts:", parts);

            // If external_id has format: payment-{loan_application_id}-{index}
            // OR a more complex format with multiple segments
            try {
              if (parts.length >= 3) {
                // Try to get the loan application ID based on your format
                // This approach supports both simple and complex formats
                const potentialLoanAppId = parts[1]; // Simple format
                const complexLoanAppId = xenditResponse.data.external_id
                  .split("-")
                  .slice(1, 6)
                  .join("-"); // Complex format

                console.log("Potential loan app IDs:", {
                  simple: potentialLoanAppId,
                  complex: complexLoanAppId,
                });

                // First try the simple format
                let [loanInfo] = await db.query(
                  `SELECT loan_id FROM loan WHERE loan_application_id = ?`,
                  [potentialLoanAppId]
                );

                // If no results, try the complex format
                if (loanInfo.length === 0) {
                  [loanInfo] = await db.query(
                    `SELECT loan_id FROM loan WHERE loan_application_id = ?`,
                    [complexLoanAppId]
                  );
                }

                console.log("Loan info:", loanInfo);

                if (loanInfo.length > 0) {
                  loanId = loanInfo[0].loan_id;
                  // Try to get the index from the last part of external_id
                  selectedTableRowIndex = parseInt(parts[parts.length - 1]);
                }
              }
            } catch (parseError) {
              console.error("Error parsing external_id:", parseError);
            }
          }

          console.log("Found loan_id and index:", {
            loanId,
            selectedTableRowIndex,
          });

          if (loanId && selectedTableRowIndex) {
            console.log(
              "Found valid loan_id and payment index, processing payment"
            );

            // Default values for payment details
            const isPastDue = false;
            const originalAmount = xenditResponse.data.amount;
            const pastDueAmount = 0;

            // Insert payment with the correct schema
            console.log("Inserting payment record for loan:", loanId);
            await db.query(
              `INSERT INTO payment 
               (loan_id, payment_amount, payment_date, payment_method, reference_number, 
                payment_status, selectedTableRowIndex, proof_of_payment, includes_past_due,
                past_due_amount, original_amount, past_due_handled, remarks) 
               VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                loanId,
                xenditResponse.data.amount,
                xenditResponse.data.payment_method || "Xendit",
                reference,
                "Approved",
                selectedTableRowIndex,
                JSON.stringify(xenditResponse.data), // Store the Xendit response as proof
                isPastDue ? 1 : 0,
                pastDueAmount,
                originalAmount,
                isPastDue ? 1 : 0, // Mark past due as handled if this was a past due payment
                `Payment received via Xendit (${
                  xenditResponse.data.payment_channel || "Online Payment"
                }) - Manual Processing`,
              ]
            );

            return res.json({
              success: true,
              message: "Payment manually processed successfully",
            });
          } else {
            console.error("Could not determine loan_id or payment index");
            return res.status(400).json({
              success: false,
              message:
                "Could not determine loan ID or payment index from reference",
            });
          }
        } else {
          console.log("Payment not marked as PAID in Xendit");
          return res.json({
            success: false,
            message: `Payment not marked as paid in Xendit (status: ${xenditResponse.data.status})`,
          });
        }
      } catch (xenditError) {
        console.error("Error checking with Xendit:", xenditError);
        return res.status(500).json({
          success: false,
          message: "Error communicating with Xendit API",
        });
      }
    } else if (paymentAttempt[0].status === "pending") {
      // Similar logic for pending payments, with appropriate modifications
      // [Code omitted for brevity - would be similar to the 'completed' case above]
      // ...

      return res.json({
        success: false,
        message: "Payment is still pending in our system",
      });
    }

    return res.json({
      success: false,
      message: "Payment could not be processed manually",
      status: paymentAttempt[0].status,
    });
  } catch (error) {
    console.error("Error in manual payment processing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment manually",
    });
  }
});

export default router;
