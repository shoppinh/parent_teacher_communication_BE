import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from 'src/admin/admin.module';
import { ParentModule } from 'src/parent/parent.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        privateKey: process.env.JWT_PRIVATE_KEY,
        signOptions: { expiresIn: process.env.JWT_EXPIRED_TIME },
      }),
    }),
    AdminModule,
    ParentModule,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
