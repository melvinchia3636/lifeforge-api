const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage and file name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
});

// Create multer upload instance
const upload = multer({
    storage: storage, limits: {
        fileSize: 100000000

    }
});

// Custom file upload middleware
const uploadMiddleware = (req, res, next) => {
    // Use multer upload instance
    upload.array('files', 50)(req, res, (err) => {
        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = uploadMiddleware;