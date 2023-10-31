import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';

import { RedisService } from '@/services/redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT
          },
          database: +process.env.REDIS_DATABASE // 命名空间，默认是0
        });
        await client.connect();
        return client;
      }
    }
  ],
  exports: [RedisService]
})
export class RedisModule {}
