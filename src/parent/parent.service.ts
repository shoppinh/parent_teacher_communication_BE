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

  createParentUserRelationAggregation() {
    return this.model
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user');
  }
  async getParentList(sort: Partial<ParentSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.createParentUserRelationAggregation();
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

  async getParentDetail(id: string) {
    return this.model.findById(id).exec();
  }

  async getAllChildrenOfParent(id: string) {
    const aggregation = this.createParentUserRelationAggregation();
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
