import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ConstantLeaveFormStatus } from '../../shared/utils/constant/progress';

export class CheckLeaveFormDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @IsIn([ConstantLeaveFormStatus.PENDING, ConstantLeaveFormStatus.APPROVED, ConstantLeaveFormStatus.REJECTED])
  status: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  classId: string;
}
