import { ApiModelProperty } from '@nestjs/swagger/dist/decorators/api-model-property.decorator';
import { AddUserDto } from '../../auth/dto/add-user.dto';

export class AddParentDto extends AddUserDto {
  @ApiModelProperty({ required: true })
  address: string;

  @ApiModelProperty({ required: false })
  gender?: string;

  @ApiModelProperty({ required: false })
  age?: string;

  @ApiModelProperty({ required: false })
  job?: string;

  @ApiModelProperty({ required: false })
  ward?: string;

  @ApiModelProperty({ required: false })
  district?: string;

  @ApiModelProperty({ required: false })
  province?: string;

  @ApiModelProperty({ required: false })
  country?: string;
}
