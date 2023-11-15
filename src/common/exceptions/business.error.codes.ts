// 自定义的错误请求码，最佳实践是推荐使用从@nestjs/common导入的 HttpStatus枚举。
export const BUSINESS_ERROR_CODE = {
  // 公共错误码
  COMMON: 400,
  UN_AUTHORIZATION: 401,
  USER_ALREADY_EXISTS: 409,
  // 特殊错误码
  TOKEN_INVALID: 10002,
  // 禁止访问
  ACCESS_FORBIDDEN: 10003,
  // 权限已禁用
  PERMISSION_DISABLED: 10003,
  // 用户已冻结
  USER_DISABLED: 10004
};
