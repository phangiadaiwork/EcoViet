import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { ResponseMessage } from 'src/decorators/response.decorator';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ResponseMessage("Upload file success")
  @UseInterceptors(FileInterceptor('fileImg'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    try {
      const fileName = await this.fileService.saveFileAvatar(file, 'avatars');
      const imageUrl = `/images/avatars/${fileName}`;
      
      return {
        url: imageUrl,
        filename: fileName,
        originalName: file.originalname,
        size: file.size
      };
    } catch (error) {
      throw new BadRequestException('Upload file thất bại');
    }
  }
}
