import express from 'express';

import config from '../config.js';

let db = config.mySqlDriver;

const router = express.Router();

import multer from 'multer';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

let firebaseStorage = config.firebaseStorage;

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, 'uploads');
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}_${Date.now()}.xlsx`);
  }
});
const upload = multer({ storage: multer.memoryStorage() });

let mapped = {
  Borrower: { table_name: 'borrower_account', column_id: 'borrower_id' },
  'Loan Officer': { table_name: 'loan_officer', column_id: 'officer_id' },
  Collector: { table_name: 'collector_account', column_id: 'collector_id' },
  Admin: { table_name: 'admin_account', column_id: 'admin_id' }
};

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [resul1] = await db.query(
      'SELECT * FROM user_account WHERE user_id  = ?',
      [req.params.id]
    );

    let { borrower_id, officer_id, collector_id, admin_id, role_id } =
      resul1[0];

    let selected_id = borrower_id || officer_id || collector_id || admin_id;

    const roleQuery = `SELECT * FROM user_role WHERE role_id = ?`;
    const [roleResult] = await db.query(roleQuery, [role_id]);

    let roleName = roleResult[0].role_name;

    let table_name = mapped[roleName].table_name;
    let column_id = mapped[roleName].column_id;

    console.log({ table_name, column_id });

    const [result] = await db.query(
      `SELECT * FROM ${table_name} WHERE ${column_id}  = ?`,
      [selected_id]
    );

    console.log({ result });
    let data = {
      ...result[0],
      role: roleName
    };
    res.status(200).json({ success: true, data: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create a new role
router.post('/', async (req, res) => {
  const { role_id, role_name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO user_role (role_id, role_name) VALUES (?, ?)',
      [role_id, role_name]
    );
    res
      .status(201)
      .json({ success: true, id: result.insertId, role_id, role_name });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all roles
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM user_role');
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update a role
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const role = req.body.role;
  let data = req.body;
  try {
    if (role === 'Borrower') {
      // Dynamically construct the SQL query based on fields in the request body
      const fields = Object.keys(data)
        .filter(key => key !== 'role') // Exclude the 'role' field from the update
        .map(key => `${key} = ?`)
        .join(', ');

      const values = Object.keys(data)
        .filter(key => key !== 'role')
        .map(key => data[key]);

      if (fields.length > 0) {
        const [result] = await db.query(
          `UPDATE borrower_account SET ${fields} WHERE borrower_id = ?`,
          [...values, userId]
        );
      }
    }

    res.status(200).json({ success: true, message: 'Updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a role
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM user_role WHERE role_id = ?', [
      req.params.id
    ]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: 'Role not found' });
    res.status(200).json({ success: true, message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/uploadProfilePicture',
  authenticateUserMiddleware,
  upload.single('profilePic'),
  async (req, res) => {
    try {
      const file = req.file;

      let loggedInUser = req.user;

      let id = loggedInUser.user_id;
      let role = loggedInUser.role;

      const storageRef = ref(
        firebaseStorage,
        `lendease/user/${id}/profile_pic/${file.originalname}`
      );
      const metadata = { contentType: file.mimetype };

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file.buffer, metadata);

      // Get the file's download URL
      const downloadURL = await getDownloadURL(storageRef);

      console.log({ downloadURL, role, id });

      const [resul1] = await db.query(
        'SELECT * FROM user_account WHERE user_id  = ?',
        [id]
      );

      let { borrower_id } = resul1[0];

      if (role === 'Borrower') {
        const query = `UPDATE borrower_account SET profile_pic = ?
        WHERE borrower_id  = ?`;
        await db.execute(query, [downloadURL, borrower_id]);

        res.json({ success: true });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send(error.message);
    }
  }
);

// get all borrowers
router.get('/borrowers/list', async (req, res) => {
  try {
    const [messages] = await db.query(`SELECT * FROM borrower_account
      order by first_name DESC
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

router.post(
  '/register',
  // authenticateUserMiddleware,
  // upload.single('profilePic'),
  async (req, res) => {
    let data = req.body;

    let {
      first_name,
      middle_name,
      last_name,
      address_region,
      address_province,
      address_city,
      address_barangay,
      email,
      password,
      contact_number,
      date_of_birth,
      role,
      gender,
      nationality
    } = data;

    let mapped = {
      Borrower: 'borrower_account',
      'Loan Officer': 'loan_officer',
      Collector: 'collector_account'
    };

    const checkRole = async (email, contact_number, role) => {
      let table_name = mapped[role];

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

    const result = await checkAllRoles(email, contact_number);

    if (result.exists) {
      return res.status(400).json({
        success: false,
        message: 'Email or Contact Number already exists.'
      });
    } else {
      const [result] = await db.query(
        `
        INSERT INTO ${mapped[role]} (
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
        gender,
        nationality
    
  ) VALUES (?, ?, ?, ?, ? , ?, ?, ?, ?, ? , ? ,? )

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
          gender,
          nationality
        ]
      );

      const insertedId = result.insertId;

      const roleQuery = `SELECT * FROM user_role WHERE role_name = ?`;
      const [roleResult] = await db.query(roleQuery, [role]);

      let role_id = roleResult[0].role_id;

      let mappedColumnId = {
        Borrower: 'borrower_id',
        'Loan Officer': 'officer_id',
        Collector: 'collector_id'
      };
      const queryInsertAccount = `
            INSERT INTO user_account (
                username,
                password,
                role_id,
                ${mappedColumnId[role]}

            ) VALUES (?, ?, ?, ?)
      `;

      const valuesInsertAccount = [email, password, role_id, insertedId];

      await db.query(queryInsertAccount, valuesInsertAccount);

      res.status(200).json({
        success: true,
        needVerification: true
      });
    }
  }
);

export default router;
