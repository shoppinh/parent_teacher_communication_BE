import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto extends BaseDto {
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  parentId?: string;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  classId?: string;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  age?: number;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  relationship: string;
}
