import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { BaseDto } from 'src/shared/dto/base.dto';

export class ExportReportCardDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  year: number;
  @ApiModelProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  semester: number;
}
