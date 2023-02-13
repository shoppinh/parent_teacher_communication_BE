import { Module } from '@nestjs/common';
import { ProgressTrackingController } from './progress-tracking.controller';
import { ProgressTrackingService } from './service/progress-tracking.service';
import { LeaveFormService } from './service/leave-form.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schema/progress.schema';
import { LeaveForm, LeaveFormSchema } from './schema/leave-form.schema';

@Module({
  controllers: [ProgressTrackingController],
  providers: [ProgressTrackingService, LeaveFormService],
  exports: [ProgressTrackingService, LeaveFormService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Progress.name,
        schema: ProgressSchema,
      },
      {
        name: LeaveForm.name,
        schema: LeaveFormSchema,
      },
    ]),
  ],
})
export class ProgressTrackingModule {}
