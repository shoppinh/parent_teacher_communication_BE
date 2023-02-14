import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiException } from '../shared/type/api-exception.model';
import { PushNotificationDto } from './dto/push-notification.dto';
import { ApiResponse } from '../shared/response/api-response';
import { MessageService } from './service/message.service';
import { PushNotificationService } from './service/push-notification.service';
import { PaginationDto } from '../shared/dto/pagination.dto';

@ApiTags('Message')
@ApiHeader({ name: 'locale', description: 'en' })
@ApiHeader({ name: 'version', description: '1' })
@Controller('api/push-notification')
export class PushNotificationController {
  //TODO: Send push notification to student, parent, teacher
  constructor(private readonly _messageService: MessageService, private readonly _pushNotificationService: PushNotificationService) {}

  @Post('send-push-notification')
  @ApiBadRequestResponse({ type: ApiException })
  @ApiOperation({
    summary: 'For testing push notification purpose',
    description: 'For testing push notification purpose',
  })
  async sendMessage(@Body() pushNotificationData: PushNotificationDto) {
    const { fcmToken, notification, data } = pushNotificationData;
    try {
      return new ApiResponse(await this._messageService.sendMessage(fcmToken, notification, data));
    } catch (e) {
      return new ApiResponse(null, e);
    }
  }

  @Get('notification-list/:userId')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ type: ApiException })
  async getMessageLog(@Param('userId') userId: string, @Query() { skip, limit }: PaginationDto) {
    const logs = await this._pushNotificationService.getNotificationLogByUserId(userId, skip, limit);
    const result = [];
    for (const item of logs) {
      const { _id, title, body, type, read, createdAt } = item;
      result.push({ _id, title, body, type, outletId: null, read, createdAt });
    }
    return new ApiResponse(result);
  }
}
