import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class AddRoleDto {
  @ApiModelProperty({ required: true })
  roleKey: string;

  @ApiModelProperty({ required: true })
  roleName: string;

  @ApiModelProperty({ required: true })
  isActive: boolean;
}
