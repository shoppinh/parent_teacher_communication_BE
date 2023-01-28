import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class AddStudentDto extends BaseDto {
  @ApiModelProperty({ required: true })
  parentId: string;
  @ApiModelProperty({ required: true })
  classId: string;
  @ApiModelProperty({ required: true })
  name: string;
  @ApiModelProperty({ required: false })
  age?: number;
  @ApiModelProperty({ required: false })
  gender?: string;
}
