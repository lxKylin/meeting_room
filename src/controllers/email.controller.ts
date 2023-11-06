import { Controller, Get, Inject, Query, Request } from '@nestjs/common';

import { EmailService } from '../services/email.service';
import { RedisService } from '../services/redis.service';

import {
  REGISTER_CAPTCHA,
  UPDATE_PASSWORD_CAPTCHA
} from '@/common/constant/common-constants';

@Controller('captcha')
export class EmailController {
  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Get(['register', 'update_password'])
  async captcha(@Query('address') address: string, @Request() req) {
    // 生成一个长度为 6 的随机字符串
    const code: string = Math.random().toString().slice(2, 8);

    const path: string = req.route.path;

    const keyMap = {
      '/api/captcha/register': `${REGISTER_CAPTCHA}_${address}`,
      '/api/captcha/update_password': `${UPDATE_PASSWORD_CAPTCHA}_${address}`
    };

    const subjectMap = {
      '/api/captcha/register': '注册验证码',
      '/api/captcha/update_password': '修改密码验证码'
    };

    await this.redisService.set(keyMap[path], code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: subjectMap[path],
      html: `<p>你的${subjectMap[path]}是：${code}</p>` // 也可发送一个html文件(使用fs读取本地文件)
    });

    return '发送成功';
  }
}
