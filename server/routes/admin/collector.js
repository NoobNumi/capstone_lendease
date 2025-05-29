import express from "express";
import nodemailer from "nodemailer";
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
let firebaseStorage = config.firebaseStorage;
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

let mapped = {
  Borrower: { table_name: "borrower_account", column_id: "borrower_id" },
  "Loan Officer": { table_name: "loan_officer", column_id: "officer_id" },
  Collector: { table_name: "collector_account", column_id: "collector_id" },
  Admin: { table_name: "admin_account", column_id: "admin_id" },
};

router.get("/list", async (req, res) => {
  try {
    const [collectors] = await db.query(`
      SELECT 
        collector_id,
        first_name,
        middle_name,
        last_name,
        name,
        department,
        contact_number,
        email,
        username,
        password,
        no_of_borrowers
      FROM collector_account
    `);

    res.status(200).json({
      success: true,
      data: collectors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching collectors. Please try again later.",
    });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, department, username, email, contact_number } = req.body;

    // Set first_name, middle_name, and last_name to 0
    const first_name = 0;
    const middle_name = 0;
    const last_name = 0;

    // Check if email or contact_number already exists in collector_account
    const [exists] = await db.query(
      `SELECT * FROM collector_account WHERE email = ? OR contact_number = ?`,
      [email, contact_number]
    );
    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email or Contact Number already exists.",
      });
    }

    // Generate collector_id and password
    //const collector_id = uuidv4();
    const tempPassword = Math.random().toString(36).slice(-8);

    // Insert into collector_account (auto-increment collector_id)
    const [collectorResult] = await db.query(
      `INSERT INTO collector_account (
    first_name, middle_name, last_name, name, department, username, email, contact_number, no_of_borrowers
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        first_name,
        middle_name,
        last_name,
        name,
        department,
        username,
        email,
        contact_number,
      ]
    );

    const collector_id = collectorResult.insertId;

    // Insert into user_account
    await db.query(
      `INSERT INTO user_account (
        username, password, role_id, borrower_id, collector_id, admin_id, officer_id, is_verified
      ) VALUES (?, ?, 3, NULL, ?, NULL, NULL, 1)`,
      [email, tempPassword, collector_id]
    );

    // Send confirmation email with temporary password
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"" ${process.env.EMAIL}`,
      to: email,
      subject: "Your Collector Account Has Been Created",
      text: `Hello ${name},\n\nYour collector account has been created.\n\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password.\n\nThank you!`,
    });

    res.status(200).json({
      success: true,
      message: "Collector account created and confirmation email sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error creating collector account.",
    });
  }
});

router.put("/update/:id", async (req, res) => {
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
      monthly_income,
      role,
    } = req.body;

    const userId = req.params.id; // Assuming you're passing the ID of the user to be updated in the URL

    const [result] = await db.query(
      `
        UPDATE ${mapped[role].table_name} SET
          first_name = ?, 
          middle_name = ?, 
          last_name = ?, 
          address_region = ?, 
          address_province = ?, 
          address_city = ?, 
          address_barangay = ?, 
          email = ?, 
          contact_number = ?, 
          date_of_birth = ?,
          gender = ?
  
          WHERE ${mapped[role].column_id} = ?
      `,
      [
        first_name,
        middle_name,
        last_name,
        address_region,
        address_province,
        address_city,
        address_barangay,
        email,
        contact_number,
        new Date(date_of_birth)
          .toISOString()
          .slice(0, 19) // Extract YYYY-MM-DDTHH:mm:ss
          .replace("T", " "),
        gender,
        userId, // Updating by the provided user ID
      ]
    );

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating borrower account.",
    });
  }
});

// Read Borrower Account (GET)
router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM borrower_account WHERE id = ?";
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Borrower account not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching borrower account.",
    });
  }
});

// Update Borrower Account (PUT)
router.put("/update/:id", async (req, res) => {
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
      monthly_income,
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
      id,
    ];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Borrower account not found to update.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Borrower account updated successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error updating borrower account.",
    });
  }
});

// Delete Borrower Account (DELETE)
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM borrower_account WHERE id = ?";
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Borrower account not found to delete.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Borrower account deleted successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error deleting borrower account.",
    });
  }
});

export default router;
