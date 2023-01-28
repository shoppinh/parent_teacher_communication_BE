import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Class, ClassDocument } from './schema/class.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ClassService extends BaseService<Class> {
  constructor(
    @InjectModel(Class.name)
    readonly _classDocumentModel: Model<ClassDocument>,
  ) {
    super();
    this.model = _classDocumentModel;
  }
}