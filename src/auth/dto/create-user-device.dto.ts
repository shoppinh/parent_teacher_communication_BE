import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class CreateUserDeviceDto {
  @ApiModelProperty()
  readonly userId: string;

  @ApiModelProperty()
  readonly fcmToken: string;
}
