import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from 'src/shared/dto/base.dto';

export class ExportReportCardDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  year: string;
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  semester: string;
}
