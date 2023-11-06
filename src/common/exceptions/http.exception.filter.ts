// HTTP类型接口相关异常 -> 异常过滤器
// http.exception.filter.ts => Catch 的参数为 HttpException 将只捕获 HTTP 相关的异常错误
import { Response, Request } from 'express';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException
  // HttpStatus
} from '@nestjs/common';
import { BusinessException } from './business.exception';

/**
 * @Catch()装饰器绑定所需的元数据到异常过滤器上。
 * 它告诉 Nest这个特定的过滤器正在寻找 HttpException 而不是其他的。
 * 在实践中，@Catch() 可以传递多个参数，所以你可以通过逗号分隔来为多个类型的异常设置过滤器。
 * Catch 的参数为 HttpException 将只捕获 HTTP 相关的异常错误
 * Catch 的参数为空时，默认捕获所有异常
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 所有异常过滤器都应该实现通用的 ExceptionFilter<T> 接口。
   * 它需要你使用有效签名提供 catch(exception: T, host: ArgumentsHost)方法。T 表示异常的类型。
   */
  /**
   * @param exception 当前正在处理的异常对象
   * @param host 一个 ArgumentsHost 对象，是一个功能强大的实用程序对象，使用它来获取对 Request 和 Response 对象的引用
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // 获取请求上下文
    const response = ctx.getResponse<Response>(); // 获取请求上下文中的 response对象
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus(); // 获取异常状态码

    // 处理业务异常
    if (exception instanceof BusinessException) {
      const error = exception.getResponse();
      // status(HttpStatus.OK)
      response.status(error['code']).json({
        status: error['code'],
        message: error['message'],
        success: false,
        data: null,
        extra: {}
      });
      return;
    }

    const error = exception.getResponse();
    response.status(status).json({
      status,
      message: error['message'],
      timestamp: new Date().toISOString(),
      path: request.url
    });
  }
}
