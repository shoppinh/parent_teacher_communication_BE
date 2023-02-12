import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/service/base.service';
import { LeaveForm, LeaveFormDocument } from '../schema/leave-form.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LeaveFormService extends BaseService<LeaveForm> {
  constructor(@InjectModel(LeaveForm.name) private readonly leaveFormModel: Model<LeaveFormDocument>) {
    super();
    this.model = leaveFormModel;
  }
}
