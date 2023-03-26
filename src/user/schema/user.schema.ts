import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from '../../shared/schema/base.schema';
import { Exclude } from 'class-transformer';
import { Document } from 'mongoose';
import { ConstantRoles } from 'src/shared/utils/constant/role';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class User extends BaseSchema {
  @Prop({
    required: true,
    default: null,
  })
  mobilePhone: string;

  @Prop({
    required: false,
    default: process.env.PHONE_COUNTRY_CODE_DEFAULT || '+84',
  })
  mobilePhoneCode: string;

  @Exclude()
  @Prop({ required: false, default: null })
  password?: string;

  @Prop({
    required: false,
    lowercase: true,
    default: null,
  })
  email?: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: false })
  firstname: string;

  @Prop({ required: false })
  lastname: string;
  @Prop({ required: false })
  fullname: string;

  @Prop({ required: false })
  lastLoggedIn?: Date;

  @Prop({ required: false, default: true })
  isActive?: boolean;

  @Prop({ required: true, default: ConstantRoles.PARENT })
  role: string;
  // @Prop({ required: false })
  // twoFactorEnabled: string;

  @Prop({ required: false })
  defaultLanguage: string;
  @Prop({ required: false, default: 'https://th.bing.com/th/id/R.cb979a51044ff1d707208265c08f43f6?rik=6KsQropxk5X%2b8Q&pid=ImgRaw&r=0' })
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hooks
UserSchema.pre<UserDocument>('save', function (next) {
  this.email = this.email?.trim()?.toLowerCase();
  this.mobilePhone = this.mobilePhone?.trim();
  next();
});
