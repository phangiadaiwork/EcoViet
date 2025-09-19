import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class FileService {
    async saveFileAvatar(file: Express.Multer.File, folder: string): Promise<string> {
        const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');

        const fileName = `${randomName}${extname(file.originalname)}`;
        const folderPath = `public/images/${folder}`;

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Lưu file
        fs.writeFileSync(`${folderPath}/${fileName}`, file.buffer);

        return fileName;
    }
} 