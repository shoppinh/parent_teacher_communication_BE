import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { LeaveForm, LeaveFormDocument } from '../schema/leave-form.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { LeaveFormSortOrder } from '../dto/get-all-leave-form.dto';
import { isEmptyObject } from '../../shared/utils';

@Injectable()
export class LeaveFormService extends BaseService<LeaveForm> {
  constructor(@InjectModel(LeaveForm.name) private readonly leaveFormModel: Model<LeaveFormDocument>) {
    super();
    this.model = leaveFormModel;
  }

  async getAllLeaveFormWithFilter(filter: Partial<Record<keyof LeaveForm, unknown>>, sort: Partial<LeaveFormSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model
      .aggregate()
      .match(filter)
      .lookup({
        from: 'students',
        localField: 'studentId',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user')
      .lookup({
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class');
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
            $count: 'count',
          },
        ],
        data: paginationStage,
      })
      .exec();
  }
}
