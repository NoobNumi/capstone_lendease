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

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [resul1] = await db.query(
      'SELECT * FROM user_account WHERE user_id  = ?',
      [req.params.id]
    );

    let { borrower_id } = resul1[0];
    const [result] = await db.query(
      'SELECT * FROM borrower_account WHERE borrower_id  = ?',
      [borrower_id]
    );

    let data = {
      ...result[0],
      role: 'Borrower'
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

export default router;
