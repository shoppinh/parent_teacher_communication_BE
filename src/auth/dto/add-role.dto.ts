import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AddRoleDto {
  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  roleKey: string;

  @ApiModelProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiModelProperty({ required: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
