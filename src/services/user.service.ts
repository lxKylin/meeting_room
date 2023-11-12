import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { md5 } from '@/utils/password-handle';

import { RedisService } from '@/services/redis.service';

import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';

import { RegisterUserDto } from '@/dtos/register-user.dto';
import { LoginUserDto } from '@/dtos/login-user.dto';

import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';
import { BusinessException } from '@/common/exceptions/business.exception';
import { LoginUserVo } from '@/dtos/login-user.vo';

import uniquePermission from '@/utils/unique-permission';

import { UpdatePasswordDto } from '@/dtos/update-password.dto';

import {
  REGISTER_CAPTCHA,
  UPDATE_PASSWORD_CAPTCHA,
  UPDATE_USER_CAPTCHA
} from '@/common/constant/common-constants';
import { UpdateUserDto } from '@/dtos/update-user.dto';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  /**
   * 注册
   * @param user
   * @returns
   */
  async register(user: RegisterUserDto) {
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

    const captcha = await this.redisService.get(
      `${REGISTER_CAPTCHA}_${user.email}`
    );

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

  /**
   * 登录
   * @param loginUser
   * @param isAdmin
   * @returns
   */
  async login(loginUser: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin
      },
      relations: ['roles', 'roles.permissions'] // 设置级联查询 roles 和 roles.permissions。
    });

    if (!user || user.password !== md5(loginUser.password)) {
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: '账号或密码错误'
      });
    }

    const userInfoVo = new LoginUserVo();
    userInfoVo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      headPic: user.headPic,
      createTime: user.createTime.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      // permissions 是所有 roles 的 permissions 的合并，要去下重。
      permissions: uniquePermission(user.roles)
    };

    userInfoVo.accessToken = this.jwtService.sign(
      {
        userId: userInfoVo.userInfo.id,
        username: userInfoVo.userInfo.username,
        roles: userInfoVo.userInfo.roles,
        permissions: userInfoVo.userInfo.permissions
      },
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES || '30m'
      }
    );

    userInfoVo.refreshToken = this.jwtService.sign(
      {
        userId: userInfoVo.userInfo.id
      },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES || '7d'
      }
    );

    return userInfoVo;
  }

  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin
      },
      relations: ['roles', 'roles.permissions']
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: uniquePermission(user.roles)
    };
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return user;
  }

  async updatePassword(userId: number, passwordDto: UpdatePasswordDto) {
    const captcha = await this.redisService.get(
      `${UPDATE_PASSWORD_CAPTCHA}_${passwordDto.email}`
    );

    if (!captcha) {
      throw new BusinessException('验证码已失效');
    }

    if (passwordDto.captcha !== captcha) {
      throw new BusinessException('验证码不正确');
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    user.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(user);
      return '修改密码成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改密码失败';
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `${UPDATE_USER_CAPTCHA}_${updateUserDto.email}`
    );

    if (!captcha) {
      throw new BusinessException('验证码已失效');
    }

    if (updateUserDto.captcha !== captcha) {
      throw new BusinessException('验证码不正确');
    }

    const foundUser = await this.userRepository.findOneBy({
      id: userId
    });

    if (updateUserDto.nickName) {
      foundUser.nickName = updateUserDto.nickName;
    }
    if (updateUserDto.headPic) {
      foundUser.headPic = updateUserDto.headPic;
    }

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户信息修改成功';
    }
  }

  async freezeUserById(id) {
    const user = await this.userRepository.findOneBy({
      id
    });

    user.isFrozen = true;

    await this.userRepository.save(user);
  }

  async findUsers(
    pageNum: number,
    pageSize: number,
    username: string,
    nickname: string,
    email: string
  ) {
    const condition: Record<string, any> = {};

    if (username) {
      condition.username = Like(`%${username}%`);
    }

    if (nickname) {
      condition.nickName = Like(`%${nickname}%`);
    }

    if (email) {
      condition.email = Like(`%${email}%`);
    }

    // findAndCount 还会查询总记录数
    const [userList, total] = await this.userRepository.findAndCount({
      // 指定返回字段
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'phoneNumber',
        'isFrozen',
        'headPic',
        'createTime'
      ],
      skip: (pageNum - 1) * pageSize, // 页码减一乘以 pageSize，就是要跳过的记录数
      take: pageSize,
      where: condition
    });

    return {
      userList,
      total
    };
  }

  // 初始化数据
  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
}
