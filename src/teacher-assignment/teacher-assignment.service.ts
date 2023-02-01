import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { TeacherAssignment, TeacherAssignmentDocument } from './schema/teacher-assignment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeacherAssignmentSortOrder } from '../admin/dto/get-all-teacher-assignment.dto';
import { isEmptyObject } from '../shared/utils';

@Injectable()
export class TeacherAssignmentService extends BaseService<TeacherAssignment> {
  constructor(@InjectModel(TeacherAssignment.name) private readonly teacherAssignmentModel: Model<TeacherAssignmentDocument>) {
    super();
    this.model = teacherAssignmentModel;
  }

  async getTeacherAssignmentList(sort: Partial<TeacherAssignmentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'teacher',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .unwind('teacher')
      .lookup({
        from: 'user',
        localField: 'teacher.userId',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user')
      .lookup({
        from: 'class',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .lookup({
        from: 'subject',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      })
      .unwind('subject');
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            'user.username': { $eq: search },
          },
          {
            'subject.name': { $eq: search },
          },
          {
            'class.name': { $eq: search },
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

  async getTeacherAssignmentDetail(id: string) {
    return this.model
      .findById(id)
      .populate('classId subjectId')
      .populate({ path: 'teacherId', populate: { path: 'userId' } })
      .exec();
  }
}
