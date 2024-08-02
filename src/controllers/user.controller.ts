import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  UnauthorizedException,
  DefaultValuePipe,
  Request
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';

import { UserService } from '../services/user.service';

import { RegisterUserDto } from '@/dtos/register-user.dto';
import { UpdatePasswordDto } from '@/dtos/update-password.dto';
import { UpdateUserDto } from '@/dtos/update-user.dto';
import { LoginUserDto } from '@/dtos/login-user.dto';
import { UserDetailVo } from '@/dtos/user-detail.vo';

import { RequireLogin, UserInfo } from '@/common/decorator/custom.decorator';

import { generateParseIntPipe } from '@/common/pipe/common.pipe';

// 设置swagger文档标签分类
@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Post('register')
  @ApiOperation({
    summary: '注册' // 接口描述信息
  })
  async create(@Body() registerUserDto: RegisterUserDto) {
    return await this.userService.register(registerUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '登录' // 接口描述信息
  })
  async userLogin(@Body() loginUser: LoginUserDto) {
    const userInfoVo = await this.userService.login(loginUser);
    return userInfoVo;
  }

  @Get('refresh')
  @ApiOperation({
    summary: '刷新token' // 接口描述信息
  })
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId);

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
        email: user.email,
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

  @Get('userInfo')
  @RequireLogin()
  @ApiBearerAuth() // 标识需要token验证
  @ApiOperation({
    summary: '查询用户信息' // 接口描述信息
  })
  async info(@UserInfo('userId') userId: string) {
    const user = await this.userService.findUserDetailById(userId);

    const userDetailVo = new UserDetailVo();

    userDetailVo.id = user.id;
    userDetailVo.username = user.username;
    userDetailVo.nickName = user.nickName;
    userDetailVo.email = user.email;
    userDetailVo.headPic = user.headPic;
    userDetailVo.phoneNumber = user.phoneNumber;
    userDetailVo.isFrozen = user.isFrozen;
    userDetailVo.isAdmin = user.isAdmin;
    userDetailVo.createTime = user.createTime;

    return userDetailVo;
  }

  @Post('update_password')
  @ApiOperation({
    summary: '修改密码' // 接口描述信息
  })
  async updatePassword(@Body() passwordDto: UpdatePasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  @Post('updateUserInfo')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新用户信息' // 接口描述信息
  })
  async update(
    @UserInfo('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @Get('freeze')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '冻结/解冻用户' // 接口描述信息
  })
  async freeze(@Query('id') id: string, @Query('isFrozen') isFrozen: boolean) {
    return await this.userService.freezeUserById(id, isFrozen);
  }

  @Get('list')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
    required: false
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
    required: false
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String,
    required: false
  })
  @ApiOperation({
    summary: '查询用户列表&筛选' // 接口描述信息
  })
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
  @ApiOperation({
    summary: '初始化数据' // 接口描述信息
  })
  async initData() {
    await this.userService.initData();
    return '初始化数据成功！';
  }
}
