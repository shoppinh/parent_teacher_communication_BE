import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { WinstonModule } from 'nest-winston';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { SettingsModule } from './settings/settings.module';
import { AppInterceptor } from './shared/interceptor/app.interceptor';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { HttpExceptionFilter } from './shared/response/http-exception.filter';
import { ParentModule } from './parent/parent.module';
import { TeacherModule } from './teacher/teacher.module';
import { ClassModule } from './class/class.module';
import { TeacherAssignmentModule } from './teacher-assignment/teacher-assignment.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_DB_URI,
        dbName: process.env.MONGO_DB_NAME,
        user: process.env.MONGO_DB_USER,
        pass: process.env.MONGO_DB_PASS,
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: process.env.DEFAULT_LANGUAGE || 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['locale'])],
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({
          filename: `public/logs/error-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `public/logs/debug-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`,
          level: 'debug',
        }),
        new winston.transports.File({
          filename: `public/logs/info-${new Date().getMonth() + 1}-${new Date().getFullYear()}.log`,
          level: 'info',
        }),
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
    }),
    SettingsModule,
    AuthModule,
    UserModule,
    PostModule,
    AdminModule,
    ParentModule,
    TeacherModule,
    ClassModule,
    TeacherAssignmentModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({}),
    },
    AppService,
  ],
})
export class AppModule {}
