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

// get all borrowers
router.get('/list', async (req, res) => {
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
      data: messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while fetching messages. Please try again later.'
    });
  }
});

// Create Borrower Account (POST)
router.post('/create', async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      address_region,
      address_province,
      address_city,
      address_barangay,
      email,
      contact_number,
      date_of_birth,
      age,
      gender,
      nationality,
      religion,
      work_type,
      position,
      status,
      monthly_income
    } = req.body;

    // Check if email already exists
    const emailQuery = 'SELECT * FROM borrower_account WHERE email = ?';
    const [emailResult] = await db.query(emailQuery, [email]);

    // Check if contact_number already exists
    const contactQuery =
      'SELECT * FROM borrower_account WHERE contact_number = ?';
    const [contactResult] = await db.query(contactQuery, [contact_number]);

    console.log({ email, emailResult });
    if (emailResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists.'
      });
    }

    if (contactResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact number already exists.'
      });
    }

    const query = `
    INSERT INTO borrower_account (
      first_name, middle_name, last_name, address_region, address_province, address_city,
      address_barangay, email, contact_number, date_of_birth, age, gender, nationality,
      religion, work_type, position, status, monthly_income
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
      first_name, // Dexter
      middle_name, // (Empty string)
      last_name, // Miranda
      address_region, // 01
      address_province, // 0128
      address_city, // MALE
      address_barangay, // 012801001
      email, // dextermiranda441@gmail.com
      contact_number, // 09275478620
      date_of_birth, // 2023-01-01
      age, // 1
      gender, // MALE
      nationality, // FILIPINO
      religion, // JW
      work_type, // Private Employee
      position, // programmer
      status, // employed
      monthly_income // (e.g., 50000.00 or any amount)
    ];

    const [result] = await db.query(query, values);

    const insertedId = result.insertId;

    const queryInsertAccount = `
    INSERT INTO user_account (
    username,
    password,
    role_id,
    borrower_id
    
    ) VALUES (?, ?, ?, ? )
  `;

    const valuesInsertAccount = [email, 'password', 4, insertedId];

    await db.query(queryInsertAccount, valuesInsertAccount);

    res.status(200).json({
      success: true,
      message: 'Borrower account created successfully!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error creating borrower account.'
    });
  }
});

// Read Borrower Account (GET)
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM borrower_account WHERE id = ?';
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Borrower account not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrower account.'
    });
  }
});

// Update Borrower Account (PUT)
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      middle_name,
      last_name,
      address_region,
      address_province,
      address_city,
      address_barangay,
      email,
      contact_number,
      date_of_birth,
      age,
      gender,
      nationality,
      religion,
      work_type,
      position,
      status,
      monthly_income
    } = req.body;

    const query = `
      UPDATE borrower_account
      SET first_name = ?, middle_name = ?, last_name = ?, address_region = ?, address_province = ?, address_city = ?,
          address_barangay = ?, email = ?, contact_number = ?, date_of_birth = ?, age = ?, gender = ?, nationality = ?,
          religion = ?, work_type = ?, position = ?, status = ?, monthly_income = ?
      WHERE id = ?
    `;
    const values = [
      first_name,
      middle_name,
      last_name,
      address_region,
      address_province,
      address_city,
      address_barangay,
      email,
      contact_number,
      date_of_birth,
      age,
      gender,
      nationality,
      religion,
      work_type,
      position,
      status,
      monthly_income,
      id
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Borrower account not found to update.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Borrower account updated successfully!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error updating borrower account.'
    });
  }
});

// Delete Borrower Account (DELETE)
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM borrower_account WHERE id = ?';
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Borrower account not found to delete.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Borrower account deleted successfully!'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error deleting borrower account.'
    });
  }
});

export default router;
