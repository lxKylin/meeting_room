import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { Permission } from '@/entities/permission.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }

    // 用户具有的权限
    const permissions: Permission[] = request.user.permissions;

    // 访问需要的权限
    const requiredPermissions: string[] = this.reflector.getAllAndOverride<
      string[]
    >('require-permission', [context.getClass(), context.getHandler()]);

    if (!requiredPermissions) {
      return true;
    }

    for (const curPermission of requiredPermissions) {
      const found: Permission = permissions.find(
        (item): boolean => item.code === curPermission
      );
      if (!found) {
        throw new UnauthorizedException('您没有访问该接口的权限');
      }
    }

    return true;
  }
}
