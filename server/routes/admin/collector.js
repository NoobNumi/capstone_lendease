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

let mapped = {
  Borrower: { table_name: 'borrower_account', column_id: 'borrower_id' },
  'Loan Officer': { table_name: 'loan_officer', column_id: 'officer_id' },
  Collector: { table_name: 'collector_account', column_id: 'collector_id' },
  Admin: { table_name: 'admin_account', column_id: 'admin_id' }
};

router.get('/list', async (req, res) => {
  try {
    const [messages] = await db.query(`


SELECT collector_account.*, u.is_verified 
FROM collector_account LEFT JOIN user_account AS u 
ON collector_account.collector_id  = u.collector_id 
ORDER BY collector_account.registration_date;



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
      monthly_income,
      role
    } = req.body;

    const checkRole = async (email, contact_number, role) => {
      let table_name = mapped[role].table_name;

      const emailQuery = `SELECT * FROM ${table_name} WHERE email = ?`;
      const [emailResult] = await db.query(emailQuery, [email]);

      // Check if contact_number already exists
      const contactQuery = `SELECT * FROM ${table_name} WHERE contact_number = ?`;
      const [contactResult] = await db.query(contactQuery, [contact_number]);

      let isExists = emailResult.length > 0 || contactResult.length > 0;
      return isExists;
    };

    const checkAllRoles = async (email, contact_number) => {
      try {
        for (const role in mapped) {
          const exists = await checkRole(email, contact_number, role);
          if (exists) {
            console.log(`Exists in role: ${role}`);
            return { exists: true, role }; // Early exit if a match is found
          }
        }
        console.log('Does not exist in any role');
        return { exists: false, role: null };
      } catch (error) {
        console.error('Error in checkAllRoles:', error.message);
        throw error;
      }
    };

    const checkResult = await checkAllRoles(email, contact_number);

    if (checkResult.exists) {
      return res.status(400).json({
        success: false,
        message: 'Email or Contact Number already exists.'
      });
    } else {
      const [result] = await db.query(
        `
        INSERT INTO ${mapped[role].table_name} (
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
        gender
    
  ) VALUES (?, ?, ?, ?, ? , ?, ?, ?, ?, ?, ?)

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
          date_of_birth,
          gender
        ]
      );

      const insertedId = result.insertId;

      const roleQuery = `SELECT * FROM user_role WHERE role_name = ?`;
      const [roleResult] = await db.query(roleQuery, [role]);

      let role_id = roleResult[0].role_id;

      const queryInsertAccount = `
            INSERT INTO user_account (
                username,
                password,
                role_id,
                ${mapped[role].column_id}

            ) VALUES (?, ?, ? ,?)
      `;

      const valuesInsertAccount = [email, 'password', role_id, insertedId];

      await db.query(queryInsertAccount, valuesInsertAccount);

      res.status(200).json({
        success: true
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error creating borrower account.'
    });
  }
});

router.put('/update/:id', async (req, res) => {
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
      role
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
          .replace('T', ' '),
        gender,
        userId // Updating by the provided user ID
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Account updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error updating borrower account.'
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
