import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({
  name: 'meeting-room'
})
export class MeetingRoom extends BaseEntity {
  @Column({
    length: 50,
    comment: '会议室名称'
  })
  name: string;

  @Column({
    comment: '会议室容量'
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置'
  })
  location: string;

  @Column({
    length: 50,
    comment: '设备',
    default: ''
  })
  equipment: string;

  @Column({
    length: 100,
    comment: '描述',
    default: ''
  })
  description: string;

  @Column({
    comment: '是否被预订',
    default: false
  })
  isBooked: boolean;
}
