import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ServiceAccount } from 'firebase-admin';
import * as admin from 'firebase-admin';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  // Set the config options
  const adminConfig: ServiceAccount = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors();
    const config = new DocumentBuilder().setTitle('Parent-Teacher-Communication').setDescription('PTC API description').setVersion('1.0').addBearerAuth().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);
  }
  const server = await app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log('\x1b[33m%s\x1b[0m', `Server :: Running @ 'http://localhost:${process.env.PORT}'`);
    console.log('\x1b[33m%s\x1b[0m', `Swagger :: Running @ 'http://localhost:${process.env.PORT}/swagger'`);
  });
  server.setTimeout(Number(process.env.APP_TIME_OUT));
}
bootstrap();
