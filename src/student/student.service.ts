import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Student, StudentDocument } from './schema/student.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { StudentSortOrder } from './dto/get-all-student.dto';
import { isEmptyObject } from '../shared/utils';
import { Progress } from '../progress-tracking/schema/progress.schema';

@Injectable()
export class StudentService extends BaseService<Student> {
  constructor(@InjectModel(Student.name) readonly _studentDocumentModel: Model<StudentDocument>) {
    super();
    this.model = _studentDocumentModel;
  }

  async getStudentList(sort?: Partial<StudentSortOrder>, search?: string, limit?: number, skip?: number, filter?: Partial<Record<keyof Student, unknown>>) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'parents',
        localField: 'parentId',
        foreignField: '_id',
        as: 'parent',
      })
      .unwind('parent')
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .match(filter ? filter : {});
    const paginationStage: PipelineStage.FacetPipelineStage[] = [
      {
        $skip: skip ? skip : 0,
      },
    ];
    if (search) {
      aggregation.match({
        $or: [
          {
            name: { $eq: search },
          },
        ],
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

  async getAllStudentByClass(classId: string) {
    return this.model
      .find({ classId: new Types.ObjectId(classId) })
      .populate('parentId')
      .exec();
  }

  async getStudentListWithoutClass(sort?: Partial<StudentSortOrder>, search?: string, limit?: number, skip?: number) {
    const aggregation = this.model
      .aggregate()
      .lookup({
        from: 'parents',
        localField: 'parentId',
        foreignField: '_id',
        as: 'parent',
      })
      .unwind('parent')
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .match({
        'class.isSchoolClass': true,
      });
    const paginationStage: PipelineStage.FacetPipelineStage[] = [
      {
        $skip: skip ? skip : 0,
      },
    ];
    if (search) {
      aggregation.match({
        $or: [
          {
            name: { $eq: search },
          },
        ],
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
}
