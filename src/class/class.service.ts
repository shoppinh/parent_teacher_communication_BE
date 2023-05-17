import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Class, ClassDocument } from './schema/class.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassSortOrder } from '../admin/dto/get-all-class.dto';
import { isEmptyObject } from '../shared/utils';
import { User } from '../user/schema/user.schema';

@Injectable()
export class ClassService extends BaseService<Class> {
  constructor(
    @InjectModel(Class.name)
    readonly _classDocumentModel: Model<ClassDocument>,
  ) {
    super();
    this.model = _classDocumentModel;
  }

  async getClassList(sort: Partial<ClassSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.model.aggregate();
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            name: { $eq: search },
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

  async getStudentListForClass(classId: string) {
    return this.model
      .aggregate()
      .match({
        _id: new Types.ObjectId(classId),
      })
      .lookup({
        from: 'students',
        localField: '_id',
        foreignField: 'classId',
        as: 'students',
      })
      .unwind({
        path: '$students',
        preserveNullAndEmptyArrays: true,
      })
      .exec();
  }
}
