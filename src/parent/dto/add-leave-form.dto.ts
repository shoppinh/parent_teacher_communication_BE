import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddLeaveFormDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  studentId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  classId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
