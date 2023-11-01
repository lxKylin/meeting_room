import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../services/user.service';
import { EmailService } from '../services/email.service';
import { RedisService } from '../services/redis.service';

import { RegisterUserDto } from '@/dtos/register-user.dto';
import { LoginUserDto } from '@/dtos/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

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

  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const userInfoVo = await this.userService.login(loginUser, false);
    return userInfoVo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const userInfoVo = await this.userService.login(loginUser, true);
    return userInfoVo;
  }

  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const { access_token, refresh_token } = this.getAccessAndRefresh(user);

      return {
        access_token,
        refresh_token
      };
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, true);

      const { access_token, refresh_token } = this.getAccessAndRefresh(user);

      return {
        access_token,
        refresh_token
      };
    } catch (e) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  getAccessAndRefresh = (user) => {
    const access_token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
      },
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES || '30m' }
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id
      },
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d' }
    );

    return { access_token, refresh_token };
  };

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化数据成功！';
  }
}
