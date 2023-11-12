module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    extraFileExtensions: ['.html', '.ejs'] // 添加这一行
  },
  // plugins 用于引入第三方插件的规则，而 extends 用于继承预定义的配置集
  // 配置插件
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-html',
    'eslint-plugin-ejs'
  ],
  // 继承，用于指定一个扩展配置文件，以便继承该配置文件的规则和设置
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:eslint-plugin-ejs'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
