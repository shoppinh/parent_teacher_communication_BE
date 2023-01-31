import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../shared/schema/base.schema';

export type UserTokenDocument = UserToken & Document;

@Schema()
export class UserToken extends BaseSchema {
  @Prop({
    required: false,
    index: true,
    trim: true,
  })
  userId?: string;

  @Prop({
    required: false,
    index: false,
    trim: true,
  })
  username?: string;

  @Prop({
    required: false,
    index: true,
    trim: true,
  })
  mobilePhone?: string;

  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  accessToken: string;

  @Prop({
    required: true,
    index: true,
    trim: true,
  })
  refreshToken: string;

  @Prop({
    required: false,
  })
  tokenType: string;

  @Prop({ required: true })
  expiresIn: string;

  @Prop({ required: false, default: false })
  isUserAdmin?: boolean;
}

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

//Index
UserTokenSchema.index({ accessToken: 1 });
