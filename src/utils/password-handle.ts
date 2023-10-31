// 加密工具函数
import * as crypto from 'crypto';

export const md5 = (password) => {
  // 返回的md5是个对象,   使用md5的方式加密
  const md5 = crypto.createHash('md5');
  // 将加密后的二进制数据转为16进制
  const result = md5.update(password).digest('hex');
  return result;
};

// 随机盐
export function makeSalt(): string {
  return crypto.randomBytes(3).toString('base64');
}

/**
 * 使用盐加密明文密码
 * @param password 密码
 * @param salt 密码盐
 */
export function encryptPassword(password: string, salt: string): string {
  if (!password || !salt) {
    return '';
  }
  const tempSalt = Buffer.from(salt, 'base64');
  return (
    // 10000 代表迭代次数 16代表长度
    crypto.pbkdf2Sync(password, tempSalt, 10000, 16, 'sha1').toString('base64')
  );
}
