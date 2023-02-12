import { BaseDto } from '../../shared/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ConstantReactionType } from '../../shared/utils/constant/post';

export class AddPostReactionDto extends BaseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  postId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.keys(ConstantReactionType))
  type: string;
}
