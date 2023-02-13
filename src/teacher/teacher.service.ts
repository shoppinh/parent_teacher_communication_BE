import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Teacher, TeacherDocument } from './schema/teacher.schema';
import { Model, Types } from 'mongoose';
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
    const aggregation = this.model.aggregate().project({
      'userId.password': 0,
    });

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

  async getProfile(userId: string) {
    return this.model
      .aggregate()
      .match({
        'userId._id': new Types.ObjectId(userId),
      })
      .project({
        'userId.password': 0,
      })
      .exec();
  }

  async getTeacherByUserId(id: string) {
    return this.model.findOne({ 'userId._id': id }).exec();
  }
}
