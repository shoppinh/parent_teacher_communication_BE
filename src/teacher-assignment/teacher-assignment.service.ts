import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { TeacherAssignment, TeacherAssignmentDocument } from './schema/teacher-assignment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeacherAssignmentSortOrder } from '../admin/dto/get-all-teacher-assignment.dto';
import { isEmptyObject } from '../shared/utils';

@Injectable()
export class TeacherAssignmentService extends BaseService<TeacherAssignment> {
  constructor(@InjectModel(TeacherAssignment.name) private readonly teacherAssignmentModel: Model<TeacherAssignmentDocument>) {
    super();
    this.model = teacherAssignmentModel;
  }

  createTeacherAssignmentRelationAggregation() {
    return this.model
      .aggregate()
      .lookup({
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .unwind('teacher');
  }

  async getTeacherAssignmentList(sort: Partial<TeacherAssignmentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.createTeacherAssignmentRelationAggregation();
    aggregation
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .lookup({
        from: 'subjects',
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

  async getTeacherAssignmentListForTeacher(teacherId: string) {
    const aggregation = this.model.aggregate();
    return aggregation
      .match({ teacherId: new Types.ObjectId(teacherId) })
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .project({
        class: 1,
      })
      .exec();
    // return this.model
    //   .find({ teacherId: new Types.ObjectId(teacherId) })
    //   .populate('classId')
    //   .exec();
  }
}
