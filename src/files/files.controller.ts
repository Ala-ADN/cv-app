import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { saveImageToStorage } from './config/multer.config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', saveImageToStorage))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: await this.filesService.processFile(file),
      filename: file.filename,
    };
  }
}