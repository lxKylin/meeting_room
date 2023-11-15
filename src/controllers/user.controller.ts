import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  UnauthorizedException,
  DefaultValuePipe
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../services/user.service';

import { RegisterUserDto } from '@/dtos/register-user.dto';
import { UpdatePasswordDto } from '@/dtos/update-password.dto';
import { UpdateUserDto } from '@/dtos/update-user.dto';
import { LoginUserDto } from '@/dtos/login-user.dto';
import { UserDetailVo } from '@/dtos/user-detail.vo';

import { RequireLogin, UserInfo } from '@/common/decorator/custom.decorator';

import { generateParseIntPipe } from '@/common/pipe/common.pipe';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Post('register')
  async create(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto);
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

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    const userDetailVo = new UserDetailVo();

    userDetailVo.id = user.id;
    userDetailVo.username = user.username;
    userDetailVo.nickName = user.nickName;
    userDetailVo.email = user.email;
    userDetailVo.headPic = user.headPic;
    userDetailVo.phoneNumber = user.phoneNumber;
    userDetailVo.isFrozen = user.isFrozen;
    userDetailVo.createTime = user.createTime;

    return userDetailVo;
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdatePasswordDto
  ) {
    return await this.userService.updatePassword(userId, passwordDto);
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @Get('freeze')
  async freeze(@Query('id') id: number) {
    return await this.userService.freezeUserById(id);
  }

  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize')
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string
  ) {
    return await this.userService.findUsers(
      pageNo,
      pageSize,
      username,
      nickName,
      email
    );
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化数据成功！';
  }
}
