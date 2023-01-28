import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class AddSubjectDto extends BaseDto {
  @ApiModelProperty({ required: true })
  name: string;
}
