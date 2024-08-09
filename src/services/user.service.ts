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
import { UserListVo } from '@/dtos/user-list.vo';

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
    } else {
      await this.redisService.del(`${REGISTER_CAPTCHA}_${user.email}`);
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

  /**
   * 登录
   * @param loginUser
   * @param isAdmin
   * @returns
   */
  async login(loginUser: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username
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
        email: userInfoVo.userInfo.email,
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

  async findUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      },
      relations: ['roles', 'roles.permissions']
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: uniquePermission(user.roles)
    };
  }

  async findUserDetailById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return user;
  }

  async updatePassword(passwordDto: UpdatePasswordDto) {
    const captcha = await this.redisService.get(
      `${UPDATE_PASSWORD_CAPTCHA}_${passwordDto.email}`
    );

    if (!captcha) {
      throw new BusinessException('验证码已失效');
    }

    if (passwordDto.captcha !== captcha) {
      throw new BusinessException('验证码不正确');
    }

    const user = await this.userRepository.findOneBy({
      username: passwordDto.username
    });

    user.password = md5(passwordDto.password);

    try {
      await this.userRepository.save(user);
      return '修改密码成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改密码失败';
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
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
      return '用户信息修改失败';
    }
  }

  async freezeUserById(id: string, isFrozen: boolean) {
    if (!id || isFrozen === undefined) {
      throw new BusinessException('请正确传参');
    }
    const user = await this.userRepository.findOneBy({
      id
    });
    if (!user) {
      throw new BusinessException('用户不存在');
    }
    try {
      user.isFrozen = !!isFrozen;

      await this.userRepository.save(user);

      return '用户状态修改成功';
    } catch (e) {
      this.logger.error(e);
      return '用户状态修改失败';
    }
  }

  async deleteUserById(id: string) {
    try {
      await this.userRepository.delete(id);
      return '删除成功';
    } catch (error) {
      console.error(error);
      return '删除失败';
    }
  }

  async findUsers(
    page: number,
    limit: number,
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
    const [records, total] = await this.userRepository.findAndCount({
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
      skip: (page - 1) * limit, // 页码减一乘以 limit，就是要跳过的记录数
      take: limit,
      where: condition
    });

    const userListVo = new UserListVo();

    userListVo.records = records;
    userListVo.total = total;

    return userListVo;
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
