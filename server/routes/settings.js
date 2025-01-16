import express from 'express';

import config from '../config.js';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

// Read a specific loan setting by ID
router.get('/read/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM loan_setting_parameters WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loan setting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan setting retrieved successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while retrieving the loan setting. Please try again later.'
    });
  }
});

// Update a loan setting
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const {
    loanType,
    minCreditScore,
    minMonthlyIncome,
    maxLoanToIncomeRatio,
    minEmploymentYears,
    interestRate
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
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Loan setting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan setting updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while updating the loan setting. Please try again later.'
    });
  }
});

export default router;
