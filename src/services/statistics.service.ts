import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { Booking } from '@/entities/booking.entity';
import { User } from '@/entities/user.entity';
import { MeetingRoom } from '@/entities/meeting-room.entity';

@Injectable()
export class StatisticsService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  /**
   * 异步获取用户在指定时间段内的预订数量
   * 此方法通过查询数据库中符合条件的预订记录，统计每个用户的预订次数
   *
   * @param {Date} startTime - 查询的开始时间
   * @param {Date} endTime - 查询的结束时间
   * @returns {Promise<any[]>} 返回一个Promise，该Promise解析为包含用户ID、用户名和预订次数的数组
   */
  async userBookingCount(startTime, endTime) {
    // 使用QueryBuilder构建查询，从Booking表中选择用户ID和用户名，以及计算预订次数
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('u.id', '用户id')
      .addSelect('u.username', '用户名')
      .leftJoin(User, 'u', 'b.userId = u.id') // 左连接User表，别名为u，连接条件是Booking表中的userId与User表中的id相等
      .addSelect('count(1)', '预定次数') // 添加选择项，计算每条记录的个数作为预订次数
      .where('b.startTime between :time1 and :time2', {
        // 设置查询条件，筛选开始时间在给定的开始时间和结束时间之间的记录
        time1: startTime,
        time2: endTime
      })
      .addGroupBy('b.user') // 按用户分组，以便计算每个用户的预订次数
      .getRawMany(); // 执行查询并获取原始数据数组

    return res;
  }

  async meetingRoomUsedCount(startTime: string, endTime: string) {
    const res = await this.entityManager
      .createQueryBuilder(Booking, 'b')
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .leftJoin(MeetingRoom, 'm', 'b.roomId = m.id')
      .addSelect('count(1)', 'usedCount')
      .where('b.startTime between :time1 and :time2', {
        time1: startTime,
        time2: endTime
      })
      .addGroupBy('b.roomId')
      .getRawMany();

    return res;
  }
}
