import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class BaseSchema {
  _id?: string;

  @Prop({ required: false })
  createdAt?: Date;

  @Prop({ required: false })
  updatedAt?: Date;
}
