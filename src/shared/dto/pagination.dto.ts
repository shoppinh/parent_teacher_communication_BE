import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class PaginationDto {
  @ApiModelPropertyOptional()
  readonly skip: number;

  @ApiModelPropertyOptional()
  readonly limit: number;
}
