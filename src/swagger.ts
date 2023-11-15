import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
/**
 * 为了节约配置项，Swagger 的配置信息全部取自 package.json，
 * 有额外需求的话可以自己维护配置信息的文件
 * 默认情况下，在 TS 开发的项目中是没办法导入 .json 后缀的模块
 * 所以可以在 tsconfig.json 中新增 resolveJsonModule 配置即可
 */

import * as packageConfig from '../package.json';

export const generateDocument = (app) => {
  const options = new DocumentBuilder()
    .setTitle(packageConfig.name)
    .setDescription(packageConfig.description)
    .setVersion(packageConfig.version)
    .addBearerAuth({
      type: 'http',
      description: '基于jwt的认证'
    })
    .build();

  // .addBearerAuth()

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('/api/doc', app, document);
};
