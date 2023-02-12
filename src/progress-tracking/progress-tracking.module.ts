import { Module } from '@nestjs/common';
import { ProgressTrackingController } from './progress-tracking.controller';
import { ProgressTrackingService } from './service/progress-tracking.service';
import { LeaveFormService } from './service/leave-form.service';

@Module({
  controllers: [ProgressTrackingController],
  providers: [ProgressTrackingService, LeaveFormService],
  exports: [ProgressTrackingService, LeaveFormService],
})
export class ProgressTrackingModule {}
