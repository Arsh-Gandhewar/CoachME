const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  const { trainer_id, date, time, amount, payment_intent_id } = req.body;
  const user_id = req.user.id;
  
  if (!trainer_id || !date || !time) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  db.run(
    `INSERT INTO bookings (user_id, trainer_id, date, time, amount, payment_intent_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
    [user_id, trainer_id, date, time, amount, payment_intent_id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ message: 'Booking created successfully', bookingId: this.lastID });
    }
  );
});

router.get('/', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const role = req.user.role;
  
  let sql;
  let params = [user_id];
  
  if (role === 'trainer') {
    sql = `
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN trainers t ON b.trainer_id = t.id
      JOIN users u ON b.user_id = u.id
      WHERE t.user_id = ?
      ORDER BY b.date DESC, b.time DESC
    `;
  } else {
    sql = `
      SELECT b.*, t.name as trainer_name, t.category as trainer_category
      FROM bookings b
      JOIN trainers t ON b.trainer_id = t.id
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.time DESC
    `;
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

module.exports = router;
