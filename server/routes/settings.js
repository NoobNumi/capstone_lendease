import express from "express";

import config from "../config.js";

import {
  authenticateUserMiddleware,
  auditTrailMiddleware,
} from "../middleware/authMiddleware.js";

let db = config.mySqlDriver;
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

// Read a specific loan setting by ID
router.get("/read/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM loan_setting_parameters WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan setting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan setting retrieved successfully",
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while retrieving the loan setting. Please try again later.",
    });
  }
});

// Update a loan setting
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    loanType,
    minCreditScore,
    minMonthlyIncome,
    maxLoanToIncomeRatio,
    minEmploymentYears,
    interestRate,
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE loan_setting_parameters
       SET 
        min_credit_score = ?, 
        min_monthly_income = ?, 
        loan_to_income_ratio = ?, 
        employment_years = ?,
        interest_rate = ? 
       WHERE id = ?`,
      [
        minCreditScore,
        minMonthlyIncome,
        maxLoanToIncomeRatio,
        minEmploymentYears,
        interestRate,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan setting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Loan setting updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while updating the loan setting. Please try again later.",
    });
  }
});

//Get SMS templates
router.get("/sms-templates", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM message_templates");

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No SMS templates found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SMS templates retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while retrieving the SMS templates. Please try again later.",
    });
  }
});

// Update SMS templates
router.post("/sms-templates/update", async (req, res) => {
  const { templates } = req.body;

  if (!Array.isArray(templates)) {
    return res.status(400).json({
      success: false,
      message: "Invalid request format. 'templates' must be an array.",
    });
  }

  try {
    for (const { id, message } of templates) {
      await db.query(
        `UPDATE message_templates SET message = ?, updated_at = NOW() WHERE id = ?`,
        [message, id]
      );
    }

    res.status(200).json({
      success: true,
      message: "SMS templates updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while updating the SMS templates. Please try again later.",
    });
  }
});

// Get all company funds
router.get("/total-company-fund", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, amount FROM total_company_fund");
    res.status(200).json({
      success: true,
      message: "Company funds retrieved successfully",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while retrieving the company funds. Please try again later.",
    });
  }
});

//update company fund
router.put("/total-company-fund/update", async (req, res) => {
  const { id, amount } = req.body;

  if (!id || !amount) {
    return res.status(400).json({
      success: false,
      message: "ID and amount are required.",
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE total_company_fund SET amount = ? WHERE id = ?`,
      [amount, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Company fund not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company fund updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while updating the company fund. Please try again later.",
    });
  }
});

export default router;
