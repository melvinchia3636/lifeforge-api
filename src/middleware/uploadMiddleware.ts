import { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

// Configure multer storage and file name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`)
    }
})

// Create multer upload instance
const upload = multer({
    storage,
    limits: {
        fileSize: 100000000
    }
})

// Custom file upload middleware
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Use multer upload instance
    upload.array('files', 25)(req, res, err => {
        // Proceed to the next middleware or route handler
        next()
    })
}

const singleUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Use multer upload instance
    upload.single('file')(req, res, err => {
        // Proceed to the next middleware or route handler
        next()
    })
}

export { uploadMiddleware, singleUploadMiddleware }