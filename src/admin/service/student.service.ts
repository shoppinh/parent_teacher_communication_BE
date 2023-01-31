import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Student, StudentDocument } from '../../parent/schema/student.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentSortOrder } from '../dto/get-all-student.dto';
import { isEmptyObject } from '../../shared/utils';

@Injectable()
export class StudentService extends BaseService<Student> {
  constructor(@InjectModel(Student.name) readonly _studentDocumentModel: Model<StudentDocument>) {
    super();
    this.model = _studentDocumentModel;
  }

  async getStudentList(sort: Partial<StudentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model.aggregate();
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            name: { $eq: search },
          },
        ],
      });
    }
    if (skip) {
      paginationStage.push({
        $skip: skip,
      });
    }
    if (limit) {
      paginationStage.push({
        $limit: limit,
      });
    }

    if (sort && !isEmptyObject(sort)) {
      aggregation.sort(sort).collation({ locale: 'en' });
    }
    return aggregation
      .facet({
        totalRecords: [
          {
            $count: 'total',
          },
        ],
        data: paginationStage,
      })
      .exec();
  }

  async getStudentDetail(id: string) {
    return this.model
      .findOne({ _id: new Types.ObjectId(id) })
      .populate({
        path: 'parentId classId',
        select: '-_id',
      })
      .exec();
  }
}
