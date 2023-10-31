import { Controller, Get, Post, Body, Inject, Query } from '@nestjs/common';

import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';
import { RedisService } from '../services/redis.service';

import { RegisterUserDto } from '../dtos/register-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Post('register')
  async create(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto);
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    // 生成一个长度为 6 的随机字符串
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是：${code}</p>` // 也可发送一个html文件(使用fs读取本地文件)
    });

    return '发送成功';
  }
}
