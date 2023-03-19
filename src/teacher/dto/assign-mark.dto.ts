import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssignMarkDto extends BaseDto {
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  frequentMark?: number;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  middleExamMark?: number;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  finalExamMark?: number;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  averageMark?: number;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  studentId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  subjectId: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  classId: string;
  @ApiModelProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  semester: number;
  @ApiModelProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  year: number;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
