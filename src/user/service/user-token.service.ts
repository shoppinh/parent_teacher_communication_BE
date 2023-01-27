import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/shared/service/base.service';
import { UserToken, UserTokenDocument } from '../schema/user-token.schema';

@Injectable()
export class UserTokenService extends BaseService<UserToken> {
  constructor(@InjectModel(UserToken.name) readonly modelUserToken: Model<UserTokenDocument>) {
    super();
    this.model = modelUserToken;
  }
}
