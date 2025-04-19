import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Request } from 'express';

// Define valid MIME types as a tuple
const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'] as const;
type ValidMimeType = typeof validMimeTypes[number];

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;
      cb(null, fileName);
    },
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    // Type-safe validation using type guard
    const isValid = validMimeTypes.some(mime => mime === file.mimetype);
    isValid ? cb(null, true) : cb(null, false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};