import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class SubjectSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  name: SortOrder;
}

export class GetAllSubjectDto extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<SubjectSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
}
