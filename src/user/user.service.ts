import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/shared/service/base.service';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectModel(User.name) readonly modelUser: Model<UserDocument>) {
    super();
    this.model = modelUser;
  }
}
