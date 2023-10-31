import { Column, Entity } from 'typeorm';

import { BaseEntity } from './base.entity';

@Entity({
  name: 'permissions'
})
export class Permission extends BaseEntity {
  @Column({
    length: 20,
    comment: '权限代码'
  })
  code: string;

  @Column({
    length: 100,
    comment: '权限描述'
  })
  description: string;
}
