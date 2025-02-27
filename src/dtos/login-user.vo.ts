// vo 是封装返回的数据
interface UserInfo {
  id: string;

  username: string;

  nickName: string;

  email: string;

  headPic: string;

  phoneNumber: string;

  isFrozen: boolean;

  isAdmin: boolean;

  createTime: number;

  roles: string[];

  permissions: string[];
}

export class LoginUserVo {
  userInfo: UserInfo;

  accessToken: string;

  refreshToken: string;
}
