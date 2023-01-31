import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly skip: number;

  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  readonly limit: number;
}
