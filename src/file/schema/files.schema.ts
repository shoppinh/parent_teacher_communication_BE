import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

import { FileType } from '../enums';
import { BaseSchema } from 'src/shared/schema/base.schema';
import { User } from 'src/user/schema/user.schema';

export class CompressedImage {
  name: string;
  path: string;
  quality: number;
}

export type FilesDocument = Files & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  timestamps: true,
  versionKey: false,
})
export class Files extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  createdBy: User;

  @Prop()
  originalName: string;

  @Prop()
  name: string;

  @Prop()
  path: string;

  @Prop({ enum: FileType, default: FileType.IMAGE_FILE, index: true })
  type: string;

  @Prop()
  expiredDate: Date;

  @Prop([CompressedImage])
  compressImages: CompressedImage[];
}

export const FilesSchema = SchemaFactory.createForClass(Files);
