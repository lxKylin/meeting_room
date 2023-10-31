import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';

@Entity({
  name: 'roles'
})
export class Role extends BaseEntity {
  @Column({
    length: 20,
    comment: '角色名'
  })
  name: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions'
  })
  permissions: Permission[];
}
