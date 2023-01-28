import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Subject, SubjectDocument } from '../schema/subject.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SubjectService extends BaseService<Subject> {
  constructor(@InjectModel(Subject.name) private readonly _subjectModel: Model<SubjectDocument>) {
    super();

    this.model = _subjectModel;
  }
}
