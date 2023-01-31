import { ApiModelPropertyOptional } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { SortOrder } from 'mongoose';
import { SortOrderDto } from '../../shared/dto/sort-order.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { IsOptional, IsString } from 'class-validator';

export class TeacherAssignmentSortOrder extends SortOrderDto {
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  subjectName: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  className: SortOrder;
  @ApiModelPropertyOptional({ default: 1, description: 'ASC or 1, DESC or -1' })
  teacherName: SortOrder;
}

export class GetAllTeacherAssignmentDto extends PaginationDto {
  @ApiModelPropertyOptional()
  @IsOptional()
  sort: Partial<TeacherAssignmentSortOrder>;
  @ApiModelPropertyOptional()
  @IsString()
  @IsOptional()
  search: string;
}
