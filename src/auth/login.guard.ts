import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

import { Permission } from '@/entities/permission.entity';

interface JwtUserData {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: Permission[];
}

declare module 'express' {
  interface Request {
    user: JwtUserData;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject()
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 是否需要登录
    const requireLogin: boolean = this.reflector.getAllAndOverride(
      'require-login',
      [context.getClass(), context.getHandler()]
    );

    if (!requireLogin) {
      return true;
    }

    const authorization: string = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try {
      const token: string = authorization.split(' ')[1];
      // 解码
      const data: JwtUserData = this.jwtService.verify<JwtUserData>(token);

      // 登录验证通过后给request挂载用户信息，以给后面的接口访问权限进行判断
      request.user = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        roles: data.roles,
        permissions: data.permissions
      };

      return true;
    } catch (e) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
