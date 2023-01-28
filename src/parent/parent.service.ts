import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/service/base.service';
import { Parent, ParentDocument } from './schema/parent.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ParentService extends BaseService<Parent> {
  constructor(
    @InjectModel(Parent.name)
    readonly _parentDocumentModel: Model<ParentDocument>,
  ) {
    super();
    this.model = _parentDocumentModel;
  }
}
