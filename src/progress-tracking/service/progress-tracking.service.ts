import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { Progress, ProgressDocument } from '../schema/progress.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProgressTrackingService extends BaseService<Progress> {
  constructor(@InjectModel(Progress.name) private readonly progressModel: Model<ProgressDocument>) {
    super();
    this.model = progressModel;
  }
}
