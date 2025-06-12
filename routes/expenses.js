const express = require('express');
const router = express.Router();
const db = require('../db');

// Add Expense
router.post('/add', (req, res) => {
  const { userId, name, amount, category, date } = req.body;
  const sql = 'INSERT INTO expenses (user_id, name, amount, category, date) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [userId, name, amount, category, date], (err, result) => {
    if (err) {
      console.error("Error inserting expense:", err);
      return res.status(500).json({ message: "Failed to add expense" });
    }
    res.json({ message: "Expense added", expenseId: result.insertId });
  });
});

// Get Expenses for a User
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch expenses" });
    res.json(results);
  });
});

// Delete Expense
router.delete('/:expenseId', (req, res) => {
  const expenseId = req.params.expenseId;
  db.query('DELETE FROM expenses WHERE id = ?', [expenseId], (err) => {
    if (err) return res.status(500).json({ message: "Failed to delete" });
    res.json({ message: "Expense deleted" });
  });
});

// Edit/Update Expense
router.put('/:expenseId', (req, res) => {
  const { name, amount, category, date } = req.body;
  const expenseId = req.params.expenseId;
  const sql = 'UPDATE expenses SET name = ?, amount = ?, category = ?, date = ? WHERE id = ?';
  db.query(sql, [name, amount, category, date, expenseId], (err) => {
    if (err) return res.status(500).json({ message: "Update failed" });
    res.json({ message: "Expense updated" });
  });
});

module.exports = router;
