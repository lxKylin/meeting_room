import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  headPic: string;

  @ApiProperty()
  createTime: Date;
}

export class UserListVo {
  @ApiProperty({
    type: [User]
  })
  rows: User[];

  @ApiProperty()
  totalCount: number;
}
