import { Injectable } from '@nestjs/common';
import { UserDeviceService } from '../../user/service/user-device.service';
import { User } from '../../user/schema/user.schema';
import * as admin from 'firebase-admin';

@Injectable()
export class MessageService {
  constructor(private readonly _userDevice: UserDeviceService) {}

  async sendMessage(fcmToken: string, notification?: { title?: string; body?: string; imageUrl?: string }, data?: { [key: string]: string }) {
    const message = {
      data,
      notification,
      token: fcmToken,
    };
    return admin.messaging().send(message);
  }

  async sendMessageToUser(user: User, title: string, body: string, data = {}) {
    const userDevices = await this._userDevice.findByUserId(user._id);
    const tokens = userDevices.map((ud) => ud.fcmToken);
    if (tokens?.length) {
      try {
        const result = await admin.messaging().sendMulticast({ tokens, notification: { title, body }, data });
        const failureIndexes = result.responses.filter((item) => !item.success).map((_, i) => i);
        if (failureIndexes?.length) {
          const listUnUsedTokens = tokens.filter((_, i) => failureIndexes.some((fI) => fI === i));
          this._userDevice.deleteUserDevicesByListFcmToken(listUnUsedTokens).then();
        }
      } catch (e) {
        console.log('sendMessageToUser -> e', e);
      }
    }
  }
}
