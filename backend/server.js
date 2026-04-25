// ==========================================
// 🏥 EPMS BACKEND - server.js (COMPLETE)
// ==========================================
// PURPOSE: Full backend server for E-Pharmacy Management System
// FEATURES:
//  • User authentication (register/login) with JWT & bcrypt
//  • Protected API routes for pharmacy operations (FULL CRUD)
//  • MySQL connection pooling for performance
//  • Centralized error handling & input validation
//  • CORS enabled for React frontend integration
// ==========================================

// 📦 1. LOAD ENVIRONMENT VARIABLES FIRST
require('dotenv').config();

// 📦 2. IMPORT DEPENDENCIES
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 🌐 3. INITIALIZE EXPRESS APPLICATION
const app = express();

// 🔧 4. CONFIGURE MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🗄️ 5. CREATE MYSQL CONNECTION POOL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'EPMS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🛡️ 6. CENTRALIZED DATABASE ERROR HANDLER
const handleDbError = (err, res) => {
  console.error('🔴 DB Error:', err.message);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Duplicate entry. Please check your input.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Invalid reference. Ensure linked item exists.' });
  }
  if (err.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({ error: 'Input exceeds maximum allowed length.' });
  }
  res.status(500).json({ error: 'Internal server error. Please try again later.' });
};

// 🔐 7. AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. Please login first.' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired session token.' });
    req.user = user;
    next();
  });
};

// ==========================================
// 🔑 8. PUBLIC AUTHENTICATION ROUTES
// ==========================================

// 📝 REGISTER NEW USER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { FirstName, LastName, Email, Password, ConfirmPassword } = req.body;
    if (!FirstName || !LastName || !Email || !Password || !ConfirmPassword) {
      return res.status(400).json({ error: 'All registration fields are required.' });
    }
    if (Password !== ConfirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (Password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const [existing] = await db.query('SELECT UserID FROM Users WHERE Email = ?', [Email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered. Please login.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    const [result] = await db.query(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash) VALUES (?, ?, ?, ?)',
      [FirstName, LastName, Email, hashedPassword]
    );
    res.status(201).json({ message: 'Registration successful.', userId: result.insertId });
  } catch (err) { handleDbError(err, res); }
});

// 🔑 LOGIN USER
app.post('/api/auth/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const [users] = await db.query('SELECT * FROM Users WHERE Email = ?', [Email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(Password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful.',
      token: token,
      user: { id: user.UserID, firstName: user.FirstName, lastName: user.LastName, email: user.Email }
    });
  } catch (err) { handleDbError(err, res); }
});

// ==========================================
// 💊 MEDICINE ROUTES (FULL CRUD) - ✅ ADDED
// ==========================================

// ✅ GET all medicines
app.get('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Medicine ORDER BY Name');
    res.json(rows);
  } catch (err) { handleDbError(err, res); }
});

// ✅ POST new medicine (already existed)
app.post('/api/medicines', authenticateToken, async (req, res) => {
  try {
    const { Name, Category, ExpiryDate } = req.body;
    if (!Name || !ExpiryDate) {
      return res.status(400).json({ error: 'Medicine Name and ExpiryDate are required.' });
    }
    const [result] = await db.query(
      'INSERT INTO Medicine (Name, Category, ExpiryDate) VALUES (?, ?, ?)',
      [Name, Category, ExpiryDate]
    );
    res.status(201).json({ message: 'Medicine added successfully.', medicineId: result.insertId });
  } catch (err) { handleDbError(err, res); }
});

// ✅ PUT update medicine
app.put('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const { Name, Category, ExpiryDate } = req.body;
    const [result] = await db.query(
      'UPDATE Medicine SET Name=?, Category=?, ExpiryDate=? WHERE MedicineID=?',
      [Name, Category, ExpiryDate, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine updated successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ✅ DELETE medicine
app.delete('/api/medicines/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Medicine WHERE MedicineID=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine deleted successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ==========================================
// 📦 STOCK ROUTES (FULL CRUD) - ✅ ADDED
// ==========================================

// ✅ GET all stocks with medicine names
app.get('/api/stocks', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, m.Name as MedicineName 
      FROM Stock s 
      LEFT JOIN Medicine m ON s.MedicineID = m.MedicineID 
      ORDER BY s.StockID DESC
    `);
    res.json(rows);
  } catch (err) { handleDbError(err, res); }
});

// ✅ POST new stock (already existed)
app.post('/api/stocks', authenticateToken, async (req, res) => {
  try {
    const { MedicineID, QuantityAvailable, UnitPrice } = req.body;
    if (MedicineID == null || QuantityAvailable == null || UnitPrice == null) {
      return res.status(400).json({ error: 'MedicineID, QuantityAvailable, and UnitPrice are required.' });
    }
    const [result] = await db.query(
      'INSERT INTO Stock (MedicineID, QuantityAvailable, UnitPrice) VALUES (?, ?, ?)',
      [MedicineID, QuantityAvailable, UnitPrice]
    );
    res.status(201).json({ message: 'Stock record added.', stockId: result.insertId });
  } catch (err) { handleDbError(err, res); }
});

// ✅ PUT update stock
app.put('/api/stocks/:id', authenticateToken, async (req, res) => {
  try {
    const { QuantityAvailable, UnitPrice } = req.body;
    const [result] = await db.query(
      'UPDATE Stock SET QuantityAvailable=?, UnitPrice=? WHERE StockID=?',
      [QuantityAvailable, UnitPrice, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Stock not found' });
    res.json({ message: 'Stock updated successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ✅ DELETE stock
app.delete('/api/stocks/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Stock WHERE StockID=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Stock not found' });
    res.json({ message: 'Stock deleted successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ==========================================
// 👥 SUPPLIERS ROUTES (FULL CRUD) - ✅ ADDED
// ==========================================

// ✅ GET all suppliers
app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Supplier ORDER BY SupplierName');
    res.json(rows);
  } catch (err) { handleDbError(err, res); }
});

// ✅ POST new supplier (already existed)
app.post('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const { SupplierName, Contact } = req.body;
    if (!SupplierName) {
      return res.status(400).json({ error: 'SupplierName is required.' });
    }
    const [result] = await db.query(
      'INSERT INTO Supplier (SupplierName, Contact) VALUES (?, ?)',
      [SupplierName, Contact]
    );
    res.status(201).json({ message: 'Supplier registered.', supplierId: result.insertId });
  } catch (err) { handleDbError(err, res); }
});

// ✅ PUT update supplier
app.put('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const { SupplierName, Contact } = req.body;
    const [result] = await db.query(
      'UPDATE Supplier SET SupplierName=?, Contact=? WHERE SupplierID=?',
      [SupplierName, Contact, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier updated successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ✅ DELETE supplier
app.delete('/api/suppliers/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Supplier WHERE SupplierID=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// ==========================================
// 💰 SALES ROUTES (FULL CRUD - Already Existed)
// ==========================================

app.post('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { MedicineID, CustomerName, QuantitySold, TotalAmount } = req.body;
    if (MedicineID == null || QuantitySold == null || TotalAmount == null) {
      return res.status(400).json({ error: 'MedicineID, QuantitySold, and TotalAmount are required.' });
    }
    const [result] = await db.query(
      'INSERT INTO SaleRecord (MedicineID, CustomerName, QuantitySold, TotalAmount) VALUES (?, ?, ?, ?)',
      [MedicineID, CustomerName, QuantitySold, TotalAmount]
    );
    res.status(201).json({ message: 'Sale recorded successfully.', saleId: result.insertId });
  } catch (err) { handleDbError(err, res); }
});

app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.SaleID, m.Name as MedicineName, s.CustomerName, s.QuantitySold, s.TotalAmount, s.SaleDate
      FROM SaleRecord s 
      LEFT JOIN Medicine m ON s.MedicineID = m.MedicineID
      ORDER BY s.SaleDate DESC
    `);
    res.json(rows);
  } catch (err) { handleDbError(err, res); }
});

app.put('/api/sales/:id', authenticateToken, async (req, res) => {
  try {
    const { CustomerName, QuantitySold, TotalAmount } = req.body;
    if (QuantitySold == null || TotalAmount == null) {
      return res.status(400).json({ error: 'QuantitySold and TotalAmount are required.' });
    }
    const [result] = await db.query(
      'UPDATE SaleRecord SET CustomerName=?, QuantitySold=?, TotalAmount=? WHERE SaleID=?',
      [CustomerName, QuantitySold, TotalAmount, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sale record not found.' });
    res.json({ message: 'Sale updated successfully.' });
  } catch (err) { handleDbError(err, res); }
});

app.delete('/api/sales/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM SaleRecord WHERE SaleID=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Sale record not found.' });
    res.json({ message: 'Sale deleted successfully.' });
  } catch (err) { handleDbError(err, res); }
});

// 🩺 HEALTH CHECK ENDPOINT
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// 🚀 10. START HTTP SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ EPMS Backend running on http://localhost:${PORT}`);
  console.log(`🔑 JWT Secret configured: ${process.env.JWT_SECRET ? '✅ Yes' : '⚠️ Missing in .env'}`);
  console.log(`🗄️ Database: ${process.env.DB_NAME || 'EPMS'} @ ${process.env.DB_HOST || 'localhost'}`);
  console.log(`🔐 Authentication: Enabled (JWT + bcrypt)`);
  console.log(`🛡️ Protected routes: /api/medicines, /api/stocks, /api/suppliers, /api/sales`);
  console.log(`✅ FULL CRUD: GET/POST/PUT/DELETE available for all entities`);
});