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
        as: 'teacherId',
      })
      .unwind('teacherId');
  }

  async getTeacherAssignmentList(sort: Partial<TeacherAssignmentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.createTeacherAssignmentRelationAggregation();
    aggregation
      .match({
        isSchoolAssign: false,
      })
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'classId',
      })
      .unwind('classId')
      .lookup({
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subjectId',
      })
      .unwind('subjectId');
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
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .match({ teacherId: new Types.ObjectId(teacherId), 'class.isSchoolClass': false })
      .project({
        class: 1,
      })
      .exec();
    // return this.model
    //   .find({ teacherId: new Types.ObjectId(teacherId) })
    //   .populate('classId')
    //   .exec();
  }

  async getTeacherAssignmentListForClass(classId: string) {
    const aggregation = this.model.aggregate();
    return aggregation
      .match({ classId: new Types.ObjectId(classId) })
      .lookup({
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      })
      .unwind('teacher')
      .lookup({
        from: 'users',
        localField: 'teacher.userId._id',
        foreignField: '_id',
        as: 'teacher.userId',
      })
      .unwind('teacher.userId')
      .lookup({
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      })
      .unwind('subject')
      .addFields({
        'teacher.userId.roleId': '$teacher.userId.role',
      })
      .project({
        __v: 0,
        'teacher.userId.password': 0,
        'teacher.userId._v': 0,
        'teacher.userId.role': 0,
        teacherId: 0,
        classId: 0,
        subjectId: 0,
      })
      .exec();
  }
}
