import {
  Controller,
  Get,
  Inject,
  Query,
  Request,
  Res,
  Session
} from '@nestjs/common';
import { Response } from 'express';

import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CaptchaService } from '../services/captcha.service';
import { RedisService } from '../services/redis.service';

import { UserInfo, RequireLogin } from '@/common/decorator/custom.decorator';

import {
  REGISTER_CAPTCHA,
  UPDATE_PASSWORD_CAPTCHA,
  UPDATE_USER_CAPTCHA
} from '@/common/constant/common-constants';

import { BusinessException } from '@/common/exceptions/business.exception';

// 设置swagger文档标签分类
@ApiTags('验证码模块')
@Controller('captcha')
export class CaptchaController {
  @Inject(CaptchaService)
  private captchaService: CaptchaService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Get(['register', 'update_password'])
  @ApiOperation({
    summary: '发送注册验证码' // 接口描述信息
  })
  async registerCaptcha(@Query('address') address: string, @Request() req) {
    const url: string = req.route.path;

    try {
      const { code, keyMap, subjectMap, emailHtml, validity } =
        this.captchaTemplate(address);

      await this.redisService.set(keyMap[url], code, validity * 60);

      await this.captchaService.sendMail({
        to: address,
        subject: subjectMap[url],
        html: emailHtml // 也可发送一个html文件(使用fs读取本地文件)
      });

      return '发送成功';
    } catch (e) {
      console.error(e);
      throw new BusinessException('发送失败！');
    }
  }

  @Get(['update_userInfo'])
  @ApiOperation({
    summary: '发送验证码' // 接口描述信息
  })
  @RequireLogin()
  async captcha(@UserInfo('email') email: string, @Request() req) {
    const url: string = req.route.path;

    try {
      const { code, keyMap, subjectMap, emailHtml, validity } =
        this.captchaTemplate(email);

      await this.redisService.set(keyMap[url], code, validity * 60);

      await this.captchaService.sendMail({
        to: email,
        subject: subjectMap[url],
        html: emailHtml // 也可发送一个html文件(使用fs读取本地文件)
      });

      return '发送成功';
    } catch (e) {
      console.error(e);
      throw new BusinessException('发送失败！');
    }
  }

  @Get('svg')
  @ApiOperation({
    summary: '登录验证码' // 接口描述信息
  })
  getSvgCaptcha(@Res() response: Response, @Session() session) {
    try {
      const { data, text } = this.captchaService.createSvgCaptcha();
      session.code = text;
      response.type('image/svg+xml');
      // response.set('Content-Type', 'image/svg+xml');
      response.send(data);
      // return {
      //   data
      // };
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 生成验证码/模版
   * @param email
   * @returns
   */
  captchaTemplate = (email: string) => {
    // 生成一个长度为 6 的随机字符串
    const code: string = Math.random().toString().slice(2, 8);
    const keyMap = {
      '/api/captcha/register': `${REGISTER_CAPTCHA}_${email}`,
      '/api/captcha/update_password': `${UPDATE_PASSWORD_CAPTCHA}_${email}`,
      '/api/captcha/update_userInfo': `${UPDATE_USER_CAPTCHA}_${email}`
    };

    const subjectMap = {
      '/api/captcha/register': '注册验证码',
      '/api/captcha/update_password': '修改密码验证码',
      '/api/captcha/update_userInfo': '修改用户信息验证码'
    };

    /**
     * // 读取 HTML 模板文件
     * 在 Nest.js 项目中，HTML 文件通常不会被自动打包到 dist 文件夹中，因为 Nest.* js主要用于构建后端应用程序，而不是前端应用程序。dist 文件夹通常包含编译后的服务* 器代码和依赖项，而不包括前端资源。
     */
    // ejs || html
    const htmlPath: string = path.join(__dirname, '../../public/email.ejs');
    // const htmlPath: string = path.join(__dirname, '../../public/email.html');
    const emailTemplate: string = fs.readFileSync(htmlPath, 'utf-8');
    // 使用 EJS 替换验证码
    const validity: number = 5; // 有效期5min
    const emailConfig = {
      code,
      validity,
      name: '晚风予星'
    };
    const emailHtml = ejs.render(emailTemplate, emailConfig);

    return {
      code,
      keyMap,
      subjectMap,
      emailHtml,
      validity
    };
  };
}
