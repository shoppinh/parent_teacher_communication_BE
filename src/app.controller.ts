import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { passwordGenerate } from './shared/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
