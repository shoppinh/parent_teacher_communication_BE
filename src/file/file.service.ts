import { Injectable } from '@nestjs/common';
import { FileType, Folder } from './enums';
import { Model, Types } from 'mongoose';
import { Files, FilesDocument } from './schema/files.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from 'src/shared/service/base.service';
import * as fs from 'fs';
import * as moment from 'moment-timezone';
import * as xlsx from 'xlsx';
import { WorkBook } from 'xlsx';
import { User } from 'src/user/schema/user.schema';
import { Student } from 'src/student/schema/student.schema';
import { ExportReportCardColumns } from '../student/enums';
import { I18nContext } from 'nestjs-i18n';

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

  async exportSemesterReportFile(
    fileName: string,
    xlsxData: Record<string, any>[],
    sheetName: string,
    currentUser: User,
    childrenExisted: Student,
    semester: number,
    year: number,
    i18n: I18nContext,
    colInfo?: xlsx.ColInfo,
    additionalLine?: Record<string, any>,
  ) {
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
    // Create a worksheet
    const ws = xlsx.utils.json_to_sheet([
      {
        A: await i18n.translate('common.semester_report_title', { args: { semester, year } }),
      },
      { A: ExportReportCardColumns.STUDENT_NAME, B: childrenExisted.name },
      {
        A: ExportReportCardColumns.CLASS,
        B: childrenExisted.classId.name,
      },
      {},
      {
        A: ExportReportCardColumns.SUBJECT_NAME,
        B: ExportReportCardColumns.FREQUENT_MARK,
        C: ExportReportCardColumns.MID_TERM_MARK,
        D: ExportReportCardColumns.FINAL_MARK,
        E: ExportReportCardColumns.AVERAGE_MARK,
      },
    ]);

    // Add subject marks to the worksheet
    xlsxData.forEach((subject, index) => {
      const row = {
        A: subject[ExportReportCardColumns.SUBJECT_NAME],
        B: subject[ExportReportCardColumns.AVERAGE_MARK],
        C: subject[ExportReportCardColumns.MID_TERM_MARK],
        D: subject[ExportReportCardColumns.FINAL_MARK],
        E: subject[ExportReportCardColumns.AVERAGE_MARK],
      };
      const rowIndex = index + 7; // Start from row 5 (0-based index)
      xlsx.utils.sheet_add_json(ws, [row], { skipHeader: true, origin: `A${rowIndex}` });
    });

    // Add semester average mark
    const lastRowIndex = xlsxData.length + 5;
    const semesterAverageRow = {
      A: ExportReportCardColumns.SEMESTER_MARK,
      B: Object.values(additionalLine)[0].toFixed(2),
    };
    xlsx.utils.sheet_add_json(ws, [semesterAverageRow], { skipHeader: true, origin: `A${lastRowIndex + 2}` });

    // Set column widths
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    const range = xlsx.utils.decode_range(ws['!ref']);
    range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
    ws['!ref'] = xlsx.utils.encode_range(range);

    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    xlsx.writeFileXLSX(wb, `${folderPath}/${fileNameWithTS}`, { bookType: 'xlsx' });
    return { fileName: fileNameWithTS, filePath, expiredDate };
  }

  async exportYearReportFile(
    fileName: string,
    semester1XlsxData: Record<string, any>[],
    semester2XlsxData: Record<string, any>[],
    sheetName: string,
    currentUser: User,
    childrenExisted: Student,
    semester: number,
    year: number,
    i18n: I18nContext,
    colInfo?: xlsx.ColInfo,
    additionalLine?: Record<string, any>,
  ) {
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
    // Create a worksheet
    const ws = xlsx.utils.json_to_sheet([
      {
        A: await i18n.translate('common.year_report_title', { args: { year } }),
      },
      { A: ExportReportCardColumns.STUDENT_NAME, B: childrenExisted.name },
      {
        A: ExportReportCardColumns.CLASS,
        B: childrenExisted.classId.name,
      },
      {},
      {
        A: ExportReportCardColumns.SUBJECT_NAME,
        B: ExportReportCardColumns.FREQUENT_MARK,
        C: ExportReportCardColumns.MID_TERM_MARK,
        D: ExportReportCardColumns.FINAL_MARK,
        E: ExportReportCardColumns.AVERAGE_MARK,
      },
      { A: await i18n.translate('common.semester_1') },
    ]);

    // Add subject marks to the worksheet
    semester1XlsxData.forEach((subject, index) => {
      const row = {
        A: subject[ExportReportCardColumns.SUBJECT_NAME],
        B: subject[ExportReportCardColumns.AVERAGE_MARK],
        C: subject[ExportReportCardColumns.MID_TERM_MARK],
        D: subject[ExportReportCardColumns.FINAL_MARK],
        E: subject[ExportReportCardColumns.AVERAGE_MARK],
      };
      const rowIndex = index + 8; // Start from row 8 (0-based index)
      xlsx.utils.sheet_add_json(ws, [row], { skipHeader: true, origin: `A${rowIndex}` });
    });

    const seperateRow = semester1XlsxData.length + 8;
    xlsx.utils.sheet_add_json(ws, [{}, { A: await i18n.translate('common.semester_2') }], { skipHeader: true, origin: `A${seperateRow}` });

    semester2XlsxData.forEach((subject, index) => {
      const row = {
        A: subject[ExportReportCardColumns.SUBJECT_NAME],
        B: subject[ExportReportCardColumns.AVERAGE_MARK],
        C: subject[ExportReportCardColumns.MID_TERM_MARK],
        D: subject[ExportReportCardColumns.FINAL_MARK],
        E: subject[ExportReportCardColumns.AVERAGE_MARK],
      };
      const rowIndex = index + semester1XlsxData.length + 10; // Calculate the start row
      xlsx.utils.sheet_add_json(ws, [row], { skipHeader: true, origin: `A${rowIndex}` });
    });

    // Add year average mark
    const yearAverageRowIndex = semester1XlsxData.length + semester2XlsxData.length + 11;
    const yearAverageRow = {
      A: ExportReportCardColumns.YEAR_MARK,
      B: Object.values(additionalLine)[0].toFixed(2),
    };
    xlsx.utils.sheet_add_json(ws, [yearAverageRow], { skipHeader: true, origin: `A${yearAverageRowIndex}` });

    // Set column widths
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    const range = xlsx.utils.decode_range(ws['!ref']);
    range.s.r = 1; // <-- zero-indexed, so setting to 1 will skip row 0
    ws['!ref'] = xlsx.utils.encode_range(range);
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    xlsx.writeFileXLSX(wb, `${folderPath}/${fileNameWithTS}`, { bookType: 'xlsx' });
    return { fileName: fileNameWithTS, filePath, expiredDate };
  }
}
