const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');
const { FILE_CONFIG } = require('../utils/constants');

// Upload directory ensure karein
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration - file ka unique naam rakho
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random number + original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File type validation filter
const fileFilter = (req, file, cb) => {
  if (FILE_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type '${file.mimetype}' allow nahi hai. Allowed: PDF, Word, Images, Zip, Text`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: FILE_CONFIG.MAX_FILE_SIZE // 10MB
  },
  fileFilter
});

module.exports = upload;
