/**
 * 自定义的装饰器
 */
import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * RequireLogin和UserInfo需要配合使用
 */

// SetMetadata设置元数据
/**
 * 需要登录
 * @returns
 */
export const RequireLogin = () => SetMetadata('require-login', true);

/**
 * 需要权限
 * @param permissions 权限名称
 * @returns
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require-permission', permissions);

// 用来取 user 信息传入 handler
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // 这里的user是在LoginGuard中设置的，所以需要两者结合使用
    if (!request.user) {
      return null;
    }
    return data ? request.user[data] : request.user;
  }
);
