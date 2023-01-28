import { AddUserDto } from '../../auth/dto/add-user.dto';
import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class AddTeacherDto extends AddUserDto {
  @ApiModelProperty({ required: true })
  address: string;

  @ApiModelProperty({ required: false })
  gender?: string;

  @ApiModelProperty({ required: false })
  age?: string;

  @ApiModelProperty({ required: false })
  degree?: string;
}
