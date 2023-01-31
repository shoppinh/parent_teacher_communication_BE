import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class UsernameLoginDto {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiModelProperty({ required: false })
  @IsOptional()
  isRemember: boolean;
}
