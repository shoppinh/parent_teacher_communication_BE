import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ConstantPostType } from '../../shared/utils/constant/post';
import { BaseDto } from '../../shared/dto/base.dto';

export class AddPostDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authorId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([ConstantPostType.PUBLIC, ConstantPostType.PRIVATE])
  type: string;
}
