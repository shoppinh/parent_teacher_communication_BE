import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Parent, ParentDocument } from './schema/parent.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ParentSortOrder } from '../admin/dto/get-all-parent.dto';
import { isEmptyObject } from '../shared/utils';

@Injectable()
export class ParentService extends BaseService<Parent> {
  constructor(
    @InjectModel(Parent.name)
    readonly _parentDocumentModel: Model<ParentDocument>,
  ) {
    super();
    this.model = _parentDocumentModel;
  }

  createParentStudentRelationAggregation() {
    return this.model
      .aggregate()
      .project({
        'userId.password': 0,
      })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .unwind('children');
  }

  async getParentList(sort: Partial<ParentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.createParentStudentRelationAggregation();
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
  async getAllChildrenOfParent(id: string) {
    const aggregation = this.createParentStudentRelationAggregation();
    return aggregation
      .match({ parentId: id })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .exec();
  }
}
