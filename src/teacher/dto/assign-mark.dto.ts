import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AssignMarkDto extends BaseDto {
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mark15?: number;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  mark45?: string;
  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  examMark?: string;
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
}