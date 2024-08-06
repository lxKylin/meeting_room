/**
 * 在项目中暂时用于快速初始化数据库数据
 */
import { repl } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
