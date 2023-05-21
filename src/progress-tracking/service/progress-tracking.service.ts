import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Progress, ProgressDocument } from '../schema/progress.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { ProgressSortOrder } from '../dto/get-all-progress-tracking.dto';
import { isEmptyObject } from '../../shared/utils';

@Injectable()
export class ProgressTrackingService extends BaseService<Progress> {
  constructor(@InjectModel(Progress.name) private readonly progressModel: Model<ProgressDocument>) {
    super();
    this.model = progressModel;
  }

  async getAllProgressTrackingWithFilter(filter: Partial<Record<keyof Progress, unknown>>, sort: Partial<ProgressSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .match(filter)
      .lookup({
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      })
      .unwind('student')
      .lookup({
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      })
      .unwind('subject')
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .project({
        __v: 0,
        studentId: 0,
        subjectId: 0,
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
            title: { $eq: search },
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

  async getDetailProgressTracking(id: string) {
    const aggregation = this.model
      .aggregate()
      .match({ _id: new Types.ObjectId(id) })
      .lookup({
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      })
      .unwind('student')
      .lookup({
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      })
      .unwind('subject');
    return aggregation.exec();
  }

  async exportReportCard(studentId: string, year: number, semester: number) {
    const aggregation = this.model
      .aggregate()
      .match({ studentId: new Types.ObjectId(studentId), year, semester })
      .lookup({
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student',
      })
      .unwind('student')
      .lookup({
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject',
      })
      .unwind('subject')
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .project({
        __v: 0,
        studentId: 0,
        subjectId: 0,
      });
    return aggregation.exec();
  }
}
