const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Signup route
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Missing username or password" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Error creating user' });
    }
    res.status(200).json({ message: 'Signup successful', userId: result.insertId }); // ✅ Send userId
  });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    res.status(200).json({ message: 'Login successful', userId: user.id }); // ✅ Send userId
  });
});

module.exports = router;
