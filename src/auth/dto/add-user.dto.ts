import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { ConstantRoles } from '../../shared/utils/constant/role';
import { BaseDto } from '../../shared/dto/base.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class AddUserDto extends BaseDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  mobilePhone: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;
  @ApiModelProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiModelProperty({ required: false, default: ConstantRoles.PARENT })
  @IsString()
  @IsOptional()
  roleKey: string;

  @ApiModelProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
