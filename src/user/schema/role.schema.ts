import { BaseSchema } from 'src/shared/schema/base.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema()
export class Role extends BaseSchema {
  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  roleKey: string;

  @Prop({
    required: true,
    trim: true,
  })
  roleName: string;

  @Prop({
    required: true,
    trim: true,
    default: true,
  })
  isActive: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
