import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Parent, ParentDocument } from './schema/parent.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .unwind({
        path: '$children',
      })
      .project({
        'userId.password': 0,
      });
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

  async getAllChildren(id: string) {
    const aggregation = this.createParentStudentRelationAggregation();
    return aggregation
      .match({ parentId: new Types.ObjectId(id) })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .exec();
  }

  async ownThisChild(parentId: string, childId: string) {}

  async getParentByUserId(userId: string) {
    return this.model.findOne({ 'userId._id': new Types.ObjectId(userId) }).exec();
  }

  async getClassListForParent(userId: string) {
    const aggregation = this.model.aggregate().project({
      'userId.password': 0,
    });
    return aggregation
      .match({ 'userId._id': new Types.ObjectId(userId) })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .unwind('children')
      .lookup({
        from: 'classes',
        localField: 'children.classId',
        foreignField: '_id',
        as: 'class',
      })
      .unwind('class')
      .match({
        'class.isSchoolClass': false,
      })
      .project({
        class: 1,
      })
      .exec();
  }

  async getParentListForClass(classId: string) {
    const aggregation = this.model.aggregate();
    return aggregation
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children',
      })
      .unwind('children')
      .match({ 'children.classId': new Types.ObjectId(classId) })
      .addFields({
        'userId.roleId': '$userId.role',
      })
      .project({
        children: 0,
        'userId.password': 0,
        'userId.role': 0,
      })

      .exec();
  }
}
