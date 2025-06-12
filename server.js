const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'aswini',
  database: 'expense_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Pass db to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

// Serve index.html by default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
