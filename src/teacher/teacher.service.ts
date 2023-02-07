import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Teacher, TeacherDocument } from './schema/teacher.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TeacherSortOrder } from '../admin/dto/get-all-teacher.dto';
import { isEmptyObject } from '../shared/utils';

@Injectable()
export class TeacherService extends BaseService<Teacher> {
  constructor(@InjectModel(Teacher.name) private readonly _teacherModelDocument: Model<TeacherDocument>) {
    super();
    this.model = _teacherModelDocument;
  }

  async getTeacherList(sort: Partial<TeacherSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user');
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            username: { $eq: search },
          },
          {
            mobilePhone: { $eq: parseInt(search) },
          },
          {
            email: { $eq: search },
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

  async getTeacherDetail(id: string) {
    return this.model.findById(id).exec();
  }
}
