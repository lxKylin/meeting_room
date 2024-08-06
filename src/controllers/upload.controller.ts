import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as path from 'path';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';

import { BusinessException } from '@/common/exceptions/business.exception';
import { fileStorage } from '@/utils/file-storage';

@ApiTags('文件上传模块')
@Controller('upload')
export class UploadController {
  /**
   * FileInterceptor接收两个参数
   * 一个 fieldName (指向包含文件的 HTML 表单的字段)
   * 可选 options 对象, 类型为 MulterOptions
   */
  @Post('picture')
  @ApiOperation({
    summary: '图片上传' // 接口描述信息
  })
  @UseInterceptors(
    FileInterceptor('picture', {
      dest: 'uploads', // 告诉 Multer 将上传文件保存在哪
      storage: fileStorage, // 磁盘存储
      // 限制图片大小
      limits: {
        fileSize: 1024 * 1024 * 5 // 5M
      },
      // 限制图片格式
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif', '.jpeg'].includes(extname)) {
          // 第一个参数是错误信息，如果没有错误的话就传入`null`
          // 第二个参数是是否接受此文件，如果不接受的话，上传文件的时候就会报错
          callback(null, true);
        } else {
          callback(new BusinessException('只能上传图片！'), false);
        }
      }
    })
  )
  // 获取header的file文件、键名
  @ApiConsumes('multipart/form-data')
  uploadPicture(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file;
  }
}
