import { Column, Entity, JoinTable, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MeetingRoom } from './meeting-room.entity';
import { User } from './user.entity';

import { BOOKING_STATUS } from '@/common/constant/common-constants';

@Entity({
  name: 'booking'
})
export class Booking extends BaseEntity {
  @Column({
    comment: '会议开始时间'
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间'
  })
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
    default: BOOKING_STATUS.apply
  })
  status: string;

  @Column({
    length: 100,
    comment: '备注',
    default: ''
  })
  note: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;
}
