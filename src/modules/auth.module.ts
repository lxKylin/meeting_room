import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';

import { LoginGuard } from '@/auth/login.guard';
import { PermissionGuard } from '@/auth/permission.guard';

@Module({
  imports: [
    // 同步
    // JwtModule.register({
    //   global: true,
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES }
    // }),
    // 异步
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ]
})
export class AuthModule {}
