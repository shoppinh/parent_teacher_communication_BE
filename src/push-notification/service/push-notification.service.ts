import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { NotificationLog, NotificationLogDocument } from '../schema/notification-log.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class PushNotificationService extends BaseService<NotificationLog> {
  constructor(@InjectModel(NotificationLog.name) readonly _notificationLogModel: Model<NotificationLogDocument>) {
    super();
    this.model = _notificationLogModel;
  }
  async countUnreadNotification(userId: string) {
    return this.model.count({ user: new Types.ObjectId(userId), read: false, deleted: false });
  }

  async getNotificationLogByUserId(userId: string, skip: number, limit: number) {
    return this.model
      .find({ user: new Types.ObjectId(userId), deleted: false })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .skip(skip)
      .limit(limit);
  }
}
