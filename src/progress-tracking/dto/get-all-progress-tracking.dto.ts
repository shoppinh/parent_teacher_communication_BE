import { BaseDto } from '../../shared/dto/base.dto';
import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProgressSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  createdAt: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  updatedAt: SortOrder;
}

export class GetAllProgressDto extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<ProgressSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  year: number;
  @ApiModelPropertyOptional()
  @IsNumber()
  @IsOptional()
  semester: number;
}
