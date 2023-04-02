import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AddClassDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiModelProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  isSchoolClass: boolean;

  @ApiModelProperty({ required: false })
  @IsBoolean()
  @IsNotEmpty()
  isPrivateClass: boolean;
}
