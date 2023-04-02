import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/shared/service/base.service';
import { User, UserDocument } from '../schema/user.schema';
import { UserSortOrder } from '../../admin/dto/get-all-user.dto';
import { isEmptyObject } from '../../shared/utils';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) readonly modelUser: Model<UserDocument>) {
    super();
    this.model = modelUser;
  }

  async getUserList(sort: Partial<UserSortOrder>, search: string, limit: number, skip: number) {
    const aggregation = this.modelUser.aggregate().project({ password: 0 });
    const paginationStage = [];
    if (search) {
      aggregation.match({
        $or: [
          {
            username: { $eq: search },
          },
          {
            mobilePhone: { $eq: search },
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
  async sendInvitation(email: string, user: User) {
    console.log('sendInvitation');
  }
}
