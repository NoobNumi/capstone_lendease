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

       
       `,
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

router.get('/loan_interest_income', async (req, res) => {
  const { startDate, endDate } = req.query;

  // Validate required query parameters
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'startDate and endDate are required' });
  }

  try {
    // Query to fetch loan interest income data
    const [rows] = await db.query(
      `

SELECT DATE(approval_date) AS date, 
       ROUND(SUM(loan_amount * (interest_rate / 100)), 2) AS totalInterestIncome
FROM loan
WHERE approval_date BETWEEN ? AND ?

AND loan_status = 'Approved'
GROUP BY DATE(approval_date)
ORDER BY DATE(approval_date) ASC;
       
       `,
      [startDate, endDate]
    );

    // Respond with the data
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// FINANCIAL TRACKING ENDPOINTS

/**
 * Financial Overview Dashboard
 * Returns summary statistics of financial activities
 */
router.get('/financial-overview', async (req, res) => {
  try {
    // Get date range (default to current month if not specified)
    const { startDate, endDate } = req.query;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const start = startDate || firstDayOfMonth.toISOString().split('T')[0];
    const end = endDate || lastDayOfMonth.toISOString().split('T')[0];

    // Get total money loaned out (disbursements)
    const [moneyOut] = await db.query(
      `
      SELECT 
        SUM(amount) AS totalDisbursed,
        COUNT(*) AS disbursementCount
      FROM disbursement_details
      WHERE disbursement_date BETWEEN ? AND ?
    `,
      [start, end]
    );

    // Get total repayments received
    const [moneyIn] = await db.query(
      `
      SELECT 
        SUM(payment_amount) AS totalRepaid,
        COUNT(*) AS paymentCount
      FROM payment
      WHERE payment_status = 'Approved' 
      AND payment_date BETWEEN ? AND ?
    `,
      [start, end]
    );

    // Get total interest earned (based on payments made)
    const [interestEarned] = await db.query(
      `
      SELECT 
        SUM(p.payment_amount - (l.loan_amount / l.repayment_schedule_id)) AS totalInterest
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      WHERE p.payment_status = 'Approved'
      AND p.payment_date BETWEEN ? AND ?
    `,
      [start, end]
    );

    // Get outstanding balance (total loans - total payments)
    const [outstanding] = await db.query(`
      SELECT 
        SUM(l.loan_amount) - COALESCE(SUM(p.payment_amount), 0) AS outstandingBalance
      FROM loan l
      LEFT JOIN payment p ON l.loan_id = p.loan_id AND p.payment_status = 'Approved'
      WHERE l.loan_status = 'Disbursed'
    `);

    res.json({
      success: true,
      data: {
        moneyOut: {
          totalDisbursed: moneyOut[0].totalDisbursed || 0,
          disbursementCount: moneyOut[0].disbursementCount || 0
        },
        moneyIn: {
          totalRepaid: moneyIn[0].totalRepaid || 0,
          paymentCount: moneyIn[0].paymentCount || 0
        },
        interestEarned: interestEarned[0].totalInterest || 0,
        outstandingBalance: outstanding[0].outstandingBalance || 0,
        period: {
          start,
          end
        }
      }
    });
  } catch (error) {
    console.error('Financial overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial overview',
      error: error.message
    });
  }
});

/**
 * Money Out (Disbursements) Tracking
 * Get detailed information about money going out
 */
router.get('/money-out', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query for disbursements with pagination
    const [disbursements] = await db.query(
      `
      SELECT 
        d.*,
        b.first_name, 
        b.last_name,
        l.loan_type_value,
        l.interest_rate
      FROM disbursement_details d
      JOIN loan l ON d.loan_id = l.loan_id
      JOIN borrower_account b ON l.borrower_id = b.borrower_id
      WHERE d.disbursement_date BETWEEN ? AND ?
      ORDER BY d.disbursement_date DESC
      LIMIT ? OFFSET ?
    `,
      [startDate, endDate, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM disbursement_details
      WHERE disbursement_date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    // Get summary statistics
    const [summary] = await db.query(
      `
      SELECT 
        SUM(amount) AS totalAmount,
        AVG(amount) AS averageAmount,
        MAX(amount) AS largestAmount,
        MIN(amount) AS smallestAmount
      FROM disbursement_details
      WHERE disbursement_date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        disbursements,
        summary: summary[0],
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Money out tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching disbursement data',
      error: error.message
    });
  }
});

/**
 * Money In (Repayments) Tracking
 * Get detailed information about money coming in
 */
router.get('/money-in', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query for payments with pagination
    const [payments] = await db.query(
      `
      SELECT 
        p.*,
        b.first_name,
        b.last_name,
        l.loan_type_value,
        l.interest_rate,
        l.loan_amount
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      JOIN borrower_account b ON l.borrower_id = b.borrower_id
      WHERE p.payment_status = 'Approved' 
      AND p.payment_date BETWEEN ? AND ?
      ORDER BY p.payment_date DESC
      LIMIT ? OFFSET ?
    `,
      [startDate, endDate, parseInt(limit), offset]
    );

    // Get total count for pagination
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM payment
      WHERE payment_status = 'Approved'
      AND payment_date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    // Get summary statistics
    const [summary] = await db.query(
      `
      SELECT 
        SUM(payment_amount) AS totalAmount,
        AVG(payment_amount) AS averageAmount,
        MAX(payment_amount) AS largestAmount,
        MIN(payment_amount) AS smallestAmount,
        COUNT(DISTINCT loan_id) AS uniqueLoans
      FROM payment
      WHERE payment_status = 'Approved'
      AND payment_date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        payments,
        summary: summary[0],
        pagination: {
          total: countResult[0].total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult[0].total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Money in tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment data',
      error: error.message
    });
  }
});

/**
 * Interest Earned Analysis
 * Calculate and track interest earned from loan repayments
 */
router.get('/interest-earned', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let timeFormat, groupByClause;

    // Set the appropriate date format and grouping based on the groupBy parameter
    switch (groupBy) {
      case 'day':
        timeFormat = '%Y-%m-%d';
        groupByClause = 'DATE(p.payment_date)';
        break;
      case 'week':
        timeFormat = '%Y-%u'; // Year-Week format
        groupByClause = 'YEARWEEK(p.payment_date)';
        break;
      case 'month':
      default:
        timeFormat = '%Y-%m';
        groupByClause = 'DATE_FORMAT(p.payment_date, "%Y-%m")';
        break;
      case 'year':
        timeFormat = '%Y';
        groupByClause = 'YEAR(p.payment_date)';
        break;
    }

    // Calculate interest earned over time
    const [interestOverTime] = await db.query(
      `
      SELECT 
        ${groupByClause} AS timePeriod,
        DATE_FORMAT(MIN(p.payment_date), '${timeFormat}') AS formattedPeriod,
        SUM(p.payment_amount) AS totalPayment,
        SUM(p.payment_amount - (l.loan_amount / l.repayment_schedule_id)) AS interestEarned,
        COUNT(DISTINCT p.loan_id) AS loanCount
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      WHERE p.payment_status = 'Approved'
      AND p.payment_date BETWEEN ? AND ?
      GROUP BY ${groupByClause}
      ORDER BY timePeriod
    `,
      [startDate, endDate]
    );

    // Get interest earned by loan type
    const [interestByLoanType] = await db.query(
      `
      SELECT 
        l.loan_type_value AS loanType,
        COUNT(DISTINCT p.loan_id) AS loanCount,
        SUM(p.payment_amount) AS totalPayment,
        SUM(p.payment_amount - (l.loan_amount / l.repayment_schedule_id)) AS interestEarned,
        AVG(l.interest_rate) AS avgInterestRate
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      WHERE p.payment_status = 'Approved'
      AND p.payment_date BETWEEN ? AND ?
      GROUP BY l.loan_type_value
      ORDER BY interestEarned DESC
    `,
      [startDate, endDate]
    );

    // Get total interest earned
    const [totalInterest] = await db.query(
      `
      SELECT 
        SUM(p.payment_amount - (l.loan_amount / l.repayment_schedule_id)) AS totalInterestEarned,
        SUM(p.payment_amount) AS totalPaymentsReceived,
        (SUM(p.payment_amount - (l.loan_amount / l.repayment_schedule_id)) / SUM(p.payment_amount) * 100) AS interestPercentage
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      WHERE p.payment_status = 'Approved'
      AND p.payment_date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        interestOverTime,
        interestByLoanType,
        summary: totalInterest[0],
        period: {
          start: startDate,
          end: endDate,
          groupBy
        }
      }
    });
  } catch (error) {
    console.error('Interest earned analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing interest earned',
      error: error.message
    });
  }
});

/**
 * Get outstanding loans report
 * Lists all loans with outstanding balances
 */
router.get('/outstanding-loans', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'dueDate',
      order = 'asc'
    } = req.query;
    const offset = (page - 1) * limit;

    // First, get the total count for pagination
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total 
      FROM loan l 
      WHERE l.loan_status IN ('Approved', 'Disbursed')
      AND (
        SELECT SUM(loan_amount) 
        FROM loan 
        WHERE loan_id = l.loan_id
      ) > (
        SELECT COALESCE(SUM(payment_amount), 0) 
        FROM payment 
        WHERE loan_id = l.loan_id AND payment_status = 'Approved'
      )
    `);

    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);

    // Then get the actual outstanding loans with detailed information
    const [loans] = await db.query(
      `
      SELECT 
        l.loan_id,
        l.loan_application_id,
        l.borrower_id,
        b.first_name,
        b.last_name,
        l.loan_amount,
        l.interest_rate,
        l.loan_status,
        l.application_date,
        l.approval_date,
        (
          SELECT SUM(payment_amount) 
          FROM payment 
          WHERE loan_id = l.loan_id AND payment_status = 'Approved'
        ) as paid_amount,
        (l.loan_amount - COALESCE((
          SELECT SUM(payment_amount) 
          FROM payment 
          WHERE loan_id = l.loan_id AND payment_status = 'Approved'
        ), 0)) as remaining_balance,
        DATEDIFF(CURRENT_DATE(), l.approval_date) as days_since_approval,
        CASE 
          WHEN DATEDIFF(CURRENT_DATE(), l.approval_date) > 30 THEN 'Overdue' 
          ELSE 'Current' 
        END as status
      FROM loan l
      JOIN borrower_account b ON l.borrower_id = b.borrower_id
      WHERE l.loan_status IN ('Approved', 'Disbursed')
      AND (l.loan_amount > COALESCE((
        SELECT SUM(payment_amount) 
        FROM payment 
        WHERE loan_id = l.loan_id AND payment_status = 'Approved'
      ), 0))
      ORDER BY ${sortBy === 'dueDate' ? 'days_since_approval' : sortBy} ${
        order === 'desc' ? 'DESC' : 'ASC'
      }
      LIMIT ? OFFSET ?
    `,
      [parseInt(limit), parseInt(offset)]
    );

    // Calculate summary statistics for outstanding loans
    const [summary] = await db.query(`
      SELECT 
        SUM(l.loan_amount - COALESCE((
          SELECT SUM(payment_amount) 
          FROM payment 
          WHERE loan_id = l.loan_id AND payment_status = 'Approved'
        ), 0)) as totalOutstanding,
        COUNT(*) as totalLoans,
        SUM(
          CASE WHEN DATEDIFF(CURRENT_DATE(), l.approval_date) > 30 THEN 1 ELSE 0 END
        ) as overdueCount
      FROM loan l
      WHERE l.loan_status IN ('Approved', 'Disbursed')
      AND (l.loan_amount > COALESCE((
        SELECT SUM(payment_amount) 
        FROM payment 
        WHERE loan_id = l.loan_id AND payment_status = 'Approved'
      ), 0))
    `);

    res.json({
      success: true,
      data: {
        loans,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages
        },
        summary: summary[0]
      }
    });
  } catch (error) {
    console.error('Error generating outstanding loans report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating outstanding loans report',
      error: error.message
    });
  }
});

/**
 * Generate Financial Report
 * Create a comprehensive financial report for a specified time period
 */
router.get('/financial-report', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Get loan disbursements during period
    const [disbursements] = await db.query(
      `
      SELECT 
        d.loan_id,
        l.loan_application_id,
        b.first_name,
        b.last_name,
        d.amount,
        d.disbursement_date,
        d.payment_method,
        d.payment_channel
      FROM disbursement_details d
      JOIN loan l ON d.loan_id = l.loan_id
      JOIN borrower_account b ON l.borrower_id = b.borrower_id
      WHERE d.disbursement_date BETWEEN ? AND ?
      ORDER BY d.disbursement_date
    `,
      [startDate, endDate]
    );

    // Get payments received during period
    const [payments] = await db.query(
      `
      SELECT 
        p.payment_id,
        p.loan_id,
        b.first_name,
        b.last_name,
        p.payment_amount,
        p.payment_date,
        p.payment_method,
        p.reference_number
      FROM payment p
      JOIN loan l ON p.loan_id = l.loan_id
      JOIN borrower_account b ON l.borrower_id = b.borrower_id
      WHERE p.payment_status = 'Approved'
      AND p.payment_date BETWEEN ? AND ?
      ORDER BY p.payment_date
    `,
      [startDate, endDate]
    );

    // Calculate summary statistics
    const [summary] = await db.query(
      `
      SELECT
        (SELECT SUM(amount) FROM disbursement_details WHERE disbursement_date BETWEEN ? AND ?) AS totalDisbursed,
        (SELECT SUM(payment_amount) FROM payment WHERE payment_status = 'Approved' AND payment_date BETWEEN ? AND ?) AS totalReceived,
        (SELECT SUM(payment_amount) - SUM(loan_amount/repayment_schedule_id) 
         FROM payment p 
         JOIN loan l ON p.loan_id = l.loan_id 
         WHERE p.payment_status = 'Approved' AND p.payment_date BETWEEN ? AND ?) AS totalInterestEarned,
        (SELECT SUM(loan_amount) - COALESCE(SUM(payment_amount), 0)
         FROM loan l
         LEFT JOIN payment p ON l.loan_id = p.loan_id AND p.payment_status = 'Approved'
         WHERE l.loan_status IN ('Approved', 'Disbursed')) AS totalOutstanding,
        (SELECT COUNT(*) FROM loan WHERE application_date BETWEEN ? AND ?) AS newLoans,
        (SELECT COUNT(*) FROM payment WHERE payment_status = 'Approved' AND payment_date BETWEEN ? AND ?) AS successfulPayments
    `,
      [
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate
      ]
    );

    // Format the response based on requested format
    if (format === 'csv') {
      // CSV headers for disbursements and payments
      let csvContent =
        'Financial Report: ' + startDate + ' to ' + endDate + '\n\n';

      // Summary section
      csvContent += 'SUMMARY\n';
      csvContent +=
        'Total Disbursed,' + (summary[0].totalDisbursed || 0) + '\n';
      csvContent += 'Total Received,' + (summary[0].totalReceived || 0) + '\n';
      csvContent +=
        'Interest Earned,' + (summary[0].totalInterestEarned || 0) + '\n';
      csvContent +=
        'Outstanding Balance,' + (summary[0].totalOutstanding || 0) + '\n';
      csvContent += 'New Loans,' + (summary[0].newLoans || 0) + '\n';
      csvContent +=
        'Successful Payments,' + (summary[0].successfulPayments || 0) + '\n\n';

      // Disbursements section
      csvContent += 'DISBURSEMENTS\n';
      csvContent += 'Loan ID,Borrower,Amount,Date,Method,Channel\n';

      disbursements.forEach(d => {
        csvContent += `${d.loan_application_id},${d.first_name} ${d.last_name},${d.amount},${d.disbursement_date},${d.payment_method},${d.payment_channel}\n`;
      });

      csvContent += '\nPAYMENTS\n';
      csvContent +=
        'Payment ID,Loan ID,Borrower,Amount,Date,Method,Reference\n';

      payments.forEach(p => {
        csvContent += `${p.payment_id},${p.loan_id},${p.first_name} ${p.last_name},${p.payment_amount},${p.payment_date},${p.payment_method},${p.reference_number}\n`;
      });

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=financial_report_${startDate}_to_${endDate}.csv`
      );

      return res.send(csvContent);
    } else {
      // Return JSON format (default)
      return res.json({
        success: true,
        data: {
          summary: summary[0],
          disbursements,
          payments,
          period: {
            start: startDate,
            end: endDate
          }
        }
      });
    }
  } catch (error) {
    console.error('Financial report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating financial report',
      error: error.message
    });
  }
});

export default router;
