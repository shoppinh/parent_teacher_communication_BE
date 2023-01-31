import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddSubjectDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
}
