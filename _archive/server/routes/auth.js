const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'trainer' ? 'trainer' : 'user';

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already in use' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const userId = this.lastID;
        
        if (userRole === 'trainer') {
          db.run(
            'INSERT INTO trainers (name, user_id, verified, premium) VALUES (?, ?, 0, 0)',
            [name, userId],
            (err2) => {
               if (err2) console.error('Error creating trainer profile:', err2);
            }
          );
        }

        const token = jwt.sign({ id: userId, role: userRole }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ 
          message: 'User registered successfully', 
          token,
          user: { id: userId, name, email, role: userRole }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

module.exports = router;
