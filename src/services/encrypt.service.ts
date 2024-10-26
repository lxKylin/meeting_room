import { Injectable } from '@nestjs/common';
// 导入相关模块
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptService {
  encrypt(plaintext: string): string {
    const key = CryptoJS.enc.Utf8.parse(process.env.SECRET_KEY.padEnd(16, '0'));
    const word = CryptoJS.enc.Utf8.parse(plaintext);
    const encrypted = CryptoJS.AES.encrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }

  decrypt(encryptedText: string): string {
    const key = CryptoJS.enc.Utf8.parse(process.env.SECRET_KEY.padEnd(16, '0'));

      const decrypt = CryptoJS.AES.decrypt(encryptedText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });

      return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  }
}
