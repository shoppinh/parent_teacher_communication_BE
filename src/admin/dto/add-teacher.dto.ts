import { AddUserDto } from '../../auth/dto/add-user.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddTeacherDto extends AddUserDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiModelProperty({ required: false })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  degree?: string;
}
