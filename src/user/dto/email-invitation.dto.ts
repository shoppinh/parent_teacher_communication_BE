import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsEmail, IsString } from 'class-validator';
import { BaseDto } from 'src/shared/dto/base.dto';

export class EmailInvitationDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiModelProperty({ required: true })
  @IsString()
  token: string;
}
