import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/modules/app.module';

import * as session from 'express-session';

import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import { ForbiddenExceptionFilter } from './common/exceptions/forbidden.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { generateDocument } from './swagger';

import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false, // 表示如果session对象没有被修改，不会强制重新保存。
      saveUninitialized: false, // 表示不会为未初始化的session对象保存到存储中。
      // 同时设置rolling、maxAge，确保只要用户与服务器保持活动，他们的session就不会过期。
      rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间(默认:false)
      cookie: { maxAge: 5 * 60 * 1000 } // 5分钟过期时间
    })
  );

  // 配置 uploads 文件夹为静态目录，以达到可直接访问下面文件的目的
  app.useStaticAssets('uploads', {
    prefix: '/api/uploads/'
  });
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

  // 支持跨域
  app.enableCors();

  // 创建swagger文档
  generateDocument(app);

  await app.listen(+process.env.SERVICE_PORT, () => {
    console.log(
      `项目运行在http://localhost:${process.env.SERVICE_PORT}/api，swagger文档运行在http://localhost:${process.env.SERVICE_PORT}/api/doc`
    );
  });
}
bootstrap();
