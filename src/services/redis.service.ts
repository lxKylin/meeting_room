import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   * @param key
   * @param value
   * @param ttl 剩余过期时间
   */
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      // 设置过期时间
      await this.redisClient.expire(key, ttl);
    }
  }
}
