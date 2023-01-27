import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseService } from 'src/shared/service/base.service';
import { UserDevice, UserDeviceDocument } from '../schema/user-device.schema';

@Injectable()
export class UserDeviceService extends BaseService<UserDevice> {
  constructor(
    @InjectModel(UserDevice.name)
    private readonly _modelUserDevice: Model<UserDeviceDocument>,
  ) {
    super();
    this.model = _modelUserDevice;
  }

  async findByUserId(userId: string) {
    return this._modelUserDevice.find({ user: new Types.ObjectId(userId) });
  }

  async deleteUserDevicesByListFcmToken(listFcmTokens: string[]) {
    return this._modelUserDevice.deleteMany({
      fcmToken: {
        $in: listFcmTokens,
      },
    });
  }
}
