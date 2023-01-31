import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class ParentSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  username: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  mobilePhone: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  email: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  age: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  gender: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  address: SortOrder;
}

export class GetAllParentDto extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<ParentSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
}
