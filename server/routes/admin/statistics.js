import express from 'express';
const router = express.Router();
import config from '../../config.js';

const db = config.mySqlDriver;

router.get('/', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Validate date range
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid date range.' });
    }

    const stats = {};

    // 1. Total Borrowers
    const [borrowerCount] = await db.query(
      `SELECT COUNT(*) AS totalBorrowers 
       FROM borrower_account 
       WHERE registration_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    stats.totalBorrowers = borrowerCount[0].totalBorrowers;

    // 2. Loan Statistics
    const [loanStats] = await db.query(
      `SELECT loan_status, COUNT(*) AS count, SUM(loan_amount) AS totalAmount 
       FROM loan 
       WHERE application_date BETWEEN ? AND ?
       GROUP BY loan_status`,
      [startDate, endDate]
    );
    stats.loanStats = loanStats;

    // 3. Disbursement Statistics
    const [disbursementStats] = await db.query(
      `SELECT COUNT(*) AS totalDisbursements, SUM(amount) AS totalDisbursed 
       FROM disbursement_details 
       WHERE disbursement_date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    stats.disbursementStats = disbursementStats[0];

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.log({
      err
    });
    res
      .status(500)
      .json({ success: false, message: 'An error occurred: ' + err.message });
  }
});

export default router;
