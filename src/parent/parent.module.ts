import { forwardRef, Module } from '@nestjs/common';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Parent, ParentSchema } from './schema/parent.schema';
import { UserModule } from '../user/user.module';
import { StudentModule } from '../student/student.module';
import { ProgressTrackingModule } from '../progress-tracking/progress-tracking.module';
import { ClassModule } from '../class/class.module';

@Module({
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Parent.name,
        schema: ParentSchema,
      },
    ]),
    UserModule,
    forwardRef(() => StudentModule),
    ProgressTrackingModule,
    ClassModule,
  ],
})
export class ParentModule {}
