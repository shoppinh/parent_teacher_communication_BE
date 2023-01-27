import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class LoginResponseDto {
  @ApiModelProperty() token: string;
  @ApiModelProperty() refreshToken: string;
}
