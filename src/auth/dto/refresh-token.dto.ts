import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  currentToken: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  currentRefreshToken: string;

  @ApiModelProperty({ required: false })
  isRemember: boolean;
}
