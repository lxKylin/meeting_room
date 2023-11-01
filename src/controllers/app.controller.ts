import { Controller, Get } from '@nestjs/common';

import {
  RequireLogin,
  RequirePermission,
  UserInfo
} from '@/common/custom-decorator';

@Controller()
export class AppController {
  @Get('aaa')
  @RequireLogin()
  @RequirePermission('ccc')
  aaaa(@UserInfo('username') username, @UserInfo() userInfo) {
    return {
      username,
      userInfo
    };
  }

  @Get('bbb')
  bbb() {
    return 'bbb';
  }
}
