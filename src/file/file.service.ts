import { Injectable } from '@nestjs/common';
import { FileType, Folder } from './enums';
import { Model, Types } from 'mongoose';
import { Files, FilesDocument } from './schema/files.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from 'src/shared/service/base.service';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import * as xlsx from 'xlsx';
import { WorkBook, WorkSheet } from 'xlsx';
import { User } from 'src/user/schema/user.schema';

@Injectable()
export class FileService extends BaseService<Files> {
  constructor(@InjectModel(Files.name) private readonly _model: Model<FilesDocument>) {
    super();
    this.model = _model;
  }
  async deleteFile(filePath: string) {
    try {
      return fs.rmSync(`./${Folder.PUBLIC}/${filePath}`);
    } catch (e) {
      return false;
    }
  }
  async createFolder(folderName: string) {
    const folderPath = `./${Folder.PUBLIC}/${folderName}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    return folderPath;
  }
  async exportXLSXFile(fileName: string, xlsxData: Record<string, any>[], sheetName: string, currentUser: User, colInfo?: xlsx.ColInfo) {
    const folderPath = await this.createFolder(Folder.TMP);
    const ts = moment().tz(process.env.TZ).format('yyyyMMDDHHmmssSSSS');
    const fileNameWithTS = `${fileName}_${ts}.xlsx`;
    const filePath = `${Folder.TMP}/${fileNameWithTS}`;
    const expiredDate = moment().tz(process.env.TZ).endOf('day').toDate();
    const existedFile = await this.findOne({ name: fileNameWithTS, type: FileType.EXCEL_FILE });
    if (existedFile) {
      await this.deleteFile(existedFile.path);
      await this.update(existedFile._id, {
        expiredDate,
      });
    } else {
      await this._model.create({
        createdBy: new Types.ObjectId(currentUser._id),
        originalName: fileNameWithTS,
        name: fileNameWithTS,
        path: filePath,
        expiredDate,
        type: FileType.EXCEL_FILE,
      });
    }
    const wb: WorkBook = xlsx.utils.book_new();
    const ws: WorkSheet = xlsx.utils.json_to_sheet(xlsxData);
    if (colInfo && xlsxData.length) {
      ws['!cols'] = Object.keys(xlsxData[0]).map(() => colInfo);
    }
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    xlsx.writeFileXLSX(wb, `${folderPath}/${fileNameWithTS}`, { bookType: 'xlsx' });
    return { fileName: fileNameWithTS, filePath, expiredDate };
  }
}
