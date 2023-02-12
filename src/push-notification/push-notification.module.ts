import { Module } from '@nestjs/common';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';

@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService]
})
export class PushNotificationModule {}
