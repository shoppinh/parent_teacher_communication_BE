import { BaseDto } from '../../shared/dto/base.dto';
import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class LeaveFormSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  createdAt: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  updatedAt: SortOrder;
}

export class GetAllLeaveForm extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<LeaveFormSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
}
