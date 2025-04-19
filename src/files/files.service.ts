import { Injectable } from '@nestjs/common';
import { FileUpload } from './interfaces/file-upload.interface';

@Injectable()
export class FilesService {
  async processFile(file: FileUpload): Promise<string> {
    // Add any additional file processing logic here
    return `File ${file.originalname} uploaded successfully`;
  }
}