import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the storage directories exist
const photosDir = './storage/photos';
const tasksDir = './storage/tasks';

if (!fs.existsSync(photosDir)) {
  fs.mkdirSync(photosDir, { recursive: true });
}

if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// Configure multer for photo uploads
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Configure multer for task uploads
const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tasksDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for photos
const photoFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// File filter for general files
const taskFileFilter = (req, file, cb) => {
  // Allow common file types for tasks
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: images, PDF, Word, Excel, CSV, and text files.'), false);
  }
};

// Create multer instances
export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

export const uploadTaskFile = multer({
  storage: taskStorage,
  fileFilter: taskFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for task files
    files: 1
  }
});

// Middleware to handle multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'File size too large. Maximum allowed size is 5MB for images and 10MB for other files.',
        key: 'file_size_too_large',
        success: false
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Only one file is allowed per upload.',
        key: 'too_many_files',
        success: false
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field.',
        key: 'unexpected_file_field',
        success: false
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: error.message,
      key: 'invalid_file_type',
      success: false
    });
  }
  
  next(error);
};
