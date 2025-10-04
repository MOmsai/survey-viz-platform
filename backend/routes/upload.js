const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const upload = multer({ storage: multer.memoryStorage() }); // Memory storage for serverless

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('No token provided');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

// Upload endpoint
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    // Process from memory buffer (no file save)
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    res.json({ data });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Error processing file');
  }
});

module.exports = router;