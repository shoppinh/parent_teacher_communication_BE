import { BaseDto } from '../../shared/dto/base.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddEventDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  date: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  startTime: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  endTime: string;
  @ApiModelProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  participants: string[];
  @ApiModelProperty({ required: true })
  @IsString()
  @IsOptional()
  content?: string;
}
