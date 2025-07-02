const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

// Config
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxFileSize = 5 * 1024 * 1024;
const uploadPath = path.join(__dirname, '../uploads/profile-images');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(createError(400, 'Invalid file type'), false);
    }
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  allowedExtensions.includes(ext)
    ? cb(null, true)
    : cb(createError(400, 'Only image files allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});

// ✅ Now export the upload object itself
module.exports = upload;
