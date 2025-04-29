const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors'); // npm install http-errors

// Validate file types
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(createError(400, 'Only image files are allowed!'), false);
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(createError(400, 'Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
}).single('profileImage'); // Match this fieldname with the frontend form input

// Error handling middleware
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(createError(413, 'File too large (max 5MB)'));
      }
      return next(err);
    }
    next();
  });
};

module.exports = handleUpload;
