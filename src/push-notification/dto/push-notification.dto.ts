import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class NotificationDto {
  @ApiModelPropertyOptional()
  title: string;

  @ApiModelPropertyOptional()
  body: string;

  @ApiModelPropertyOptional()
  imageUrl: string;
}

export class PushNotificationDto extends BaseDto {
  @ApiModelProperty()
  readonly fcmToken: string;
  @ApiModelPropertyOptional()
  readonly notification?: NotificationDto;
  @ApiModelPropertyOptional()
  readonly data: { [key: string]: string };
}
