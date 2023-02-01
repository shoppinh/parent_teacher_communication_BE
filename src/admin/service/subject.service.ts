import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Subject, SubjectDocument } from '../schema/subject.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubjectSortOrder } from '../dto/get-all-subject.dto';
import { isEmptyObject } from '../../shared/utils';

@Injectable()
export class SubjectService extends BaseService<Subject> {
  constructor(@InjectModel(Subject.name) private readonly _subjectModel: Model<SubjectDocument>) {
    super();

    this.model = _subjectModel;
  }

  async getSubjectList(sort: Partial<SubjectSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model.aggregate();
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            name: { $eq: search },
          },
          {
            code: { $eq: search },
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
}
