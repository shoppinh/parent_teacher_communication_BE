import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { passwordGenerate } from './shared/utils';
import { compare } from 'bcryptjs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<Record<any, any>> {
    const password = await passwordGenerate('123456');
    return {
      password,
      isMatch: await compare('123456', password),
    };
  }
}
