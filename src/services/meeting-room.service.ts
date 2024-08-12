import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';

import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';
import { BusinessException } from '@/common/exceptions/business.exception';

import { CreateMeetingRoomDto } from '@/dtos/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from '@/dtos/update-meeting-room.dto';

import { MeetingRoom } from '@/entities/meeting-room.entity';
import { Booking } from '@/entities/booking.entity';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>;

  @InjectEntityManager()
  private entityManager: EntityManager;
  async create(meetingRoom: CreateMeetingRoomDto) {
    const foundMeetingRoom = await this.meetingRoomRepository.findOneBy({
      name: meetingRoom.name
    });

    if (foundMeetingRoom) {
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: `${meetingRoom.name}会议室已存在`
      });
    }

    return this.meetingRoomRepository.save(meetingRoom);
  }

  async findAll(
    page: number,
    limit: number,
    name: string,
    location: string,
    isBooked: boolean
  ) {
    const condition: Record<string, any> = {};
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (location) {
      condition.location = Like(`%${location}%`);
    }
    if (isBooked) {
      condition.isBooked = isBooked;
    }

    // findAndCount 还会查询总记录数
    const [records, total] = await this.meetingRoomRepository.findAndCount({
      skip: (page - 1) * limit, // 页码减一乘以 limit，就是要跳过的记录数
      take: limit,
      where: condition
    });
    return {
      records,
      total
    };
  }

  findOneById(id: string) {
    return this.meetingRoomRepository.findOneBy({ id });
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const { id } = updateMeetingRoomDto;
    const meetingRoom = await this.meetingRoomRepository.findOneBy({ id });

    if (!meetingRoom) {
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: `会议室不存在`
      });
    }

    meetingRoom.capacity = updateMeetingRoomDto.capacity;
    meetingRoom.location = updateMeetingRoomDto.location;
    meetingRoom.name = updateMeetingRoomDto.name;

    if (updateMeetingRoomDto.description) {
      meetingRoom.description = updateMeetingRoomDto.description;
    }
    if (updateMeetingRoomDto.equipment) {
      meetingRoom.equipment = updateMeetingRoomDto.equipment;
    }

    await this.meetingRoomRepository.update(id, meetingRoom);

    return '修改成功';
  }

  /**
   * 删除时需要注意：
   * 因为 booking 表关联了 meeting-room 表，有外键约束，
   * 所以要删除所有的预定之后再去删除会议室。
   */
  async remove(id: string) {
    // 方式一
    // const bookings: Booking[] = await this.entityManager.findBy(Booking, {
    //   room: {
    //     id: id
    //   }
    // });
    // for (let i: number = 0; i < bookings.length; i++) {
    //   this.entityManager.delete(Booking, bookings[i].id);
    // }

    // 方式二
    const bookings: Booking[] = await this.bookingRepository.find({
      where: {
        room: {
          id
        }
      }
    });

    for (let i: number = 0; i < bookings.length; i++) {
      this.bookingRepository.delete(bookings[i].id);
    }

    await this.meetingRoomRepository.delete(id);
    return `删除成功`;
  }

  /**
   * 初始化数据
   */
  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '301';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '302';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '303';

    this.meetingRoomRepository.save([room1, room2, room3]);
  }
}
