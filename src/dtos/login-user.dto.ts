import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '用户名不能为空'
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '密码不能为空'
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '验证码不能为空'
  })
  code: string;
}
