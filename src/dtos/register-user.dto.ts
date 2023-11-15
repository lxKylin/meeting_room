import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  //ApiProperty是对数据类型的描述
  @ApiProperty({ description: '用户名', default: 'Kylin', type: String })
  @IsNotEmpty({
    message: '用户名不能为空'
  })
  username: string;

  @ApiProperty({ description: '昵称', default: '晚风予星', type: String })
  @IsNotEmpty({
    message: '昵称不能为空'
  })
  nickName: string;

  @ApiProperty({ description: '密码', default: '', type: String })
  @IsNotEmpty({
    message: '密码不能为空'
  })
  @MinLength(6, {
    message: '密码不能少于 6 位'
  })
  password: string;

  @ApiProperty({
    description: '邮箱',
    example: 'xx@xx.com',
    default: '',
    type: String
  })
  @IsNotEmpty({
    message: '邮箱不能为空'
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式'
    }
  )
  email: string;

  @ApiProperty({ description: '验证码', default: '', type: String })
  @IsNotEmpty({
    message: '验证码不能为空'
  })
  captcha: string;
}
