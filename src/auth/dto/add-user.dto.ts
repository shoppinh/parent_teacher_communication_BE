import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { ConstantRoles } from '../../shared/utils/constant/role';
import { BaseDto } from '../../shared/dto/base.dto';
export class AddUserDto extends BaseDto {
  @ApiModelProperty({ required: true })
  mobilePhone: string;

  @ApiModelProperty({ required: true })
  email: string;

  @ApiModelProperty({ required: true })
  username: string;

  @ApiModelProperty({ required: false })
  firstName: string;

  @ApiModelProperty({ required: false })
  lastName: string;

  @ApiModelProperty({ required: true })
  password: string;

  @ApiModelProperty({ required: false, default: ConstantRoles.PARENT })
  roleKey: string;

  @ApiModelProperty({ required: false, default: true })
  isActive: boolean;
}
