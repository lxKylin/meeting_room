import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class CaptchaService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 授权码
      }
    });
  }

  /**
   * 发送验证码
   * @param param
   */
  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      html
    });
  }

  createSvgCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4, // 验证码长度
      noise: 3, // 干扰线条的数量
      width: 100, // 验证码宽度
      height: 40, // 验证码高度
      fontSize: 40, // 字体大小
      color: true // 是否启用颜色
      // background: '#f2f2f2' // 背景颜色
    });
    return {
      // data: `${captcha.data}`,
      // btoa是一个原生的JavaScript方法，用于将字符串数据转换为Base64编码。
      // data: `data:image/svg+xml;base64,${btoa(captcha.data)}`,
      data: captcha.data,
      text: captcha.text.toLowerCase() // 转换为小写或进行其他处理
    };
  }
}
