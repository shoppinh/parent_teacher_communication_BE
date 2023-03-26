import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { AddUserDto } from '../../auth/dto/add-user.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AddParentDto extends AddUserDto {
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
  job?: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  ward?: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  country?: string;

}
