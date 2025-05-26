import express from "express";

import config from "../../config.js";

import {
  authenticateUserMiddleware,
  auditTrailMiddleware,
} from "../../middleware/authMiddleware.js";

let db = config.mySqlDriver;
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

// get all borrowers
router.get("/collections", async (req, res) => {
  try {
    const [messages] = await db.query(`
    
    
    SELECT ba.*, l.*
    FROM borrower_account AS ba
    LEFT JOIN (
      SELECT borrower_id, MAX(approval_date) AS latest_approval_date
      FROM loan
      GROUP BY borrower_id
    ) AS latest_loans  
    ON ba.borrower_id = latest_loans.borrower_id
    LEFT JOIN loan AS l
    ON l.borrower_id = latest_loans.borrower_id AND l.approval_date = latest_loans.latest_approval_date
    ORDER BY ba.first_name DESC;
    
    
    
          `);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching messages. Please try again later.",
    });
  }
});
