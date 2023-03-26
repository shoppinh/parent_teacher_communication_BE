import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddStudentDto extends BaseDto {
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  parentId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  classId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  age?: number;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  relationship: string;
}
