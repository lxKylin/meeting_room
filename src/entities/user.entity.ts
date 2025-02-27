import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Exclude } from 'class-transformer';

import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity({
  name: 'users'
})
export class User extends BaseEntity {
  @Column({
    length: 50,
    comment: '用户名',
    unique: true // 唯一
  })
  username: string;

  // 请求返回数据时将密码这个字段隐藏
  @Exclude()
  @Column({
    length: 50,
    comment: '密码'
  })
  password: string;

  @Column({
    // name: 'nick_name',
    length: 50,
    comment: '昵称'
  })
  nickName: string;

  @Column({
    comment: '邮箱',
    length: 50
  })
  email: string;

  @Column({
    comment: '头像',
    length: 100,
    nullable: true
  })
  headPic: string;

  @Column({
    comment: '手机号',
    length: 20,
    nullable: true
  })
  phoneNumber: string;

  @Column({
    comment: '是否冻结',
    default: false
  })
  isFrozen: boolean;

  @Column({
    comment: '是否是管理员',
    default: false
  })
  isAdmin: boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles' // 中间表名称
  })
  roles: Role[];
}
