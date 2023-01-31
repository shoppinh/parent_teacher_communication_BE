import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddTeacherAssignmentDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  classId: string;
}
