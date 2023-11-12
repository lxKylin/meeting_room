import { ParseIntPipe } from '@nestjs/common';

import { BusinessException } from '@/common/exceptions/business.exception';

export function generateParseIntPipe(name) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BusinessException(name + ' 应该传数字');
    }
  });
}
