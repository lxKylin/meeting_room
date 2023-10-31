import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { md5 } from '@/utils/password-handle';

import { RedisService } from '@/services/redis.service';

import { User } from '@/entities/user.entity';

import { RegisterUserDto } from '../dtos/register-user.dto';

import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';
import { BusinessException } from '@/common/exceptions/business.exception';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);

    if (!captcha) {
      // throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: '验证码已失效'
      });
    }

    if (user.captcha !== captcha) {
      // throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: '验证码不正确'
      });
    }

    const foundUser = await this.userRepository.findOneBy({
      username: user.username
    });

    if (foundUser) {
      // throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: '用户已存在'
      });
    }

    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }
}
