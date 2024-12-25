import express from 'express';

import config from '../config.js';

import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from '../middleware/authMiddleware.js';

let db = config.mySqlDriver;
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

// Create a new message
router.post('/create', async (req, res) => {
  const { sender, receiver, message, date_sent, status } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO sms (sender, receiver, message, status)
       VALUES (?, ?, ?, ?)`,
      [sender, receiver, message, status || 'Pending']
    );

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: {
        sms_id: result.insertId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while creating the message. Please try again later.'
    });
  }
});

// Get all messages
router.get('/', async (req, res) => {
  try {
    const [messages] = await db.query(`SELECT * FROM sms
      order by date_sent DESC
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

// Get a single message by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [message] = await db.query(`SELECT * FROM sms WHERE sms_id = ?`, [
      id
    ]);

    if (message.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while fetching the message. Please try again later.'
    });
  }
});

// Update a message
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { sender, receiver, message, date_sent, status } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE sms SET sender = ?, receiver = ?, message = ?, date_sent = ?, status = ? WHERE sms_id = ?`,
      [sender, receiver, message, date_sent, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while updating the message. Please try again later.'
    });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM sms WHERE sms_id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        'An error occurred while deleting the message. Please try again later.'
    });
  }
});

export default router;
