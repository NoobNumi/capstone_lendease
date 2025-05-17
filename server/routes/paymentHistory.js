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

router.post("/list", authenticateUserMiddleware, async (req, res) => {
  const { user_id } = req.user;

  try {
    // Get the borrower's ID for the logged-in user
    const [borrowerRows] = await db.query(
      `SELECT borrower_id FROM borrower_account WHERE user_id = ?`,
      [user_id]
    );
    if (!borrowerRows.length) {
      return res.status(404).json({ message: "Borrower not found." });
    }
    const borrower_id = borrowerRows[0].borrower_id;
    const [rows] = await db.query(
      `
  SELECT 
    p.payment_id,
    p.reference_number, 
    p.payment_amount, 
    p.payment_date,
    l.approval_date
  FROM payment p
  INNER JOIN loan l ON p.loan_id = l.loan_id
  INNER JOIN borrower_account ba ON l.borrower_id = ba.borrower_id
  WHERE l.borrower_id = ? AND ba.user_id = ?
  ORDER BY p.payment_date DESC
  `,
      [borrower_id, user_id]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ error: "Error fetching payment history" });
  }
});

export default router;
