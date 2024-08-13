/**
 * @description:
 * 每个entity对应一个数据库表
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/entities/user.entity';
import { Role } from '@/entities/role.entity';
import { Permission } from '@/entities/permission.entity';
import { MeetingRoom } from '@/entities/meeting-room.entity';
import { Booking } from '@/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, MeetingRoom, Booking])
  ],
  exports: [TypeOrmModule]
})
export class EntitiesModule {}
