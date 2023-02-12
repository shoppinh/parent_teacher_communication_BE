import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class EventSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  title: SortOrder;
  date: SortOrder;
}

export class GetAllEventDto extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<EventSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
}
