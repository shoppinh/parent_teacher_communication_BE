import * as path from 'path';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}-${path.extname(file.originalname)}`);
        },
      }),
    }),
  ],
})
export class FileModule {}
