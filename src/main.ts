import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/modules/app.module';

import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import { ForbiddenExceptionFilter } from './common/exceptions/forbidden.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { generateDocument } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 统一响应体格式 useGlobalInterceptors 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  /**
   * 异常过滤器 useGlobalFilters 全局异常过滤器
   * 要注意引入自定义异常的先后顺序，不然异常捕获逻辑会出现混乱
   */
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
    new ForbiddenExceptionFilter()
  );

  /**
   * 全局应用管道 对输入数据进行转换或者验证
   * 使用前 npm i --save class-validator class-transformer
   */
  app.useGlobalPipes(new ValidationPipe());

  // 创建swagger文档
  generateDocument(app);

  await app.listen(+process.env.SERVICE_PORT, () => {
    console.log(`项目运行在http://localhost:${process.env.SERVICE_PORT}/api`);
  });
}
bootstrap();
