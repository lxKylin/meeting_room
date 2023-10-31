// 全局异常拦截
// base.exception.filter => Catch 的参数为空时，默认捕获所有异常
// import { FastifyReply, FastifyRequest } from 'fastify';
import { Response, Request } from 'express';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  ServiceUnavailableException
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // request.log.error(exception);

    // 非 HTTP 标准异常的处理。
    response.status(HttpStatus.SERVICE_UNAVAILABLE).send({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: new ServiceUnavailableException().getResponse()
    });
  }
}
