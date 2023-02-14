import { Module } from '@nestjs/common';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './service/push-notification.service';
import { MessageService } from './service/message.service';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationLog, NotificationLogSchema } from './schema/notification-log.schema';

@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService, MessageService],
  exports: [PushNotificationService, MessageService],
  imports: [
    UserModule,
    MongooseModule.forFeature([
      {
        name: NotificationLog.name,
        schema: NotificationLogSchema,
      },
    ]),
  ],
})
export class PushNotificationModule {}
