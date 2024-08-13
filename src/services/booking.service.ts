import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  EntityManager,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual
} from 'typeorm';

import { BUSINESS_ERROR_CODE } from '@/common/exceptions/business.error.codes';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ResponseData } from '@/common/types';
import { BOOKING_STATUS } from '@/common/constant/common-constants';

import { CreateBookingDto } from '@/dtos/create-booking.dto';

import { User } from '@/entities/user.entity';
import { MeetingRoom } from '@/entities/meeting-room.entity';
import { Booking } from '@/entities/booking.entity';

import { RedisService } from '@/services/redis.service';
import { CaptchaService } from '@/services/captcha.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>;

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(CaptchaService)
  private readonly captchaService: CaptchaService;

  async create(bookingDto: CreateBookingDto, userId: string) {
    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: bookingDto.meetingRoomId
    });

    if (!meetingRoom) {
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: `该会议室不存在！`
      });
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId
    });

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(bookingDto.bookingTime[0]);
    booking.endTime = new Date(bookingDto.bookingTime[2]);

    const condition: Record<string, any> = {};
    condition.room = meetingRoom;
    // MoreThanOrEqual：大于或等于
    // LessThanOrEqual：小于或等于
    condition.startTime = MoreThanOrEqual(booking.startTime);
    condition.endTime = LessThanOrEqual(booking.endTime);

    const bookingRes: Booking =
      await this.bookingRepository.findOneBy(condition);

    if (bookingRes) {
      throw new BusinessException({
        code: BUSINESS_ERROR_CODE.COMMON,
        message: `${bookingRes.room.name}该时段已被预定！`
      });
    }

    // await this.entityManager.save(Booking, booking);

    return this.bookingRepository.save(booking);
  }

  async getBookingList(
    page: number,
    limit: number,
    status: string,
    username: string,
    meetingRoomName: string,
    location: string,
    bookingTime: Array<string>
  ): Promise<ResponseData<Booking[]>> {
    const condition: Record<string, any> = {
      user: {},
      room: {}
    };
    if (status) {
      condition.status = status;
    }
    if (bookingTime) {
      condition.startTime = Between(bookingTime[0], bookingTime[1]);
    }
    if (username) {
      condition.user.username = Like(`%${username}%`);
    }
    if (meetingRoomName) {
      condition.room.name = Like(`%${meetingRoomName}%`);
    }
    if (location) {
      condition.room.location = Like(`%${location}%`);
    }
    // findAndCount 还会查询总记录数
    const [records, total] = await this.bookingRepository.findAndCount({
      relations: {
        user: true,
        room: true
      },
      skip: (page - 1) * limit, // 页码减一乘以 limit，就是要跳过的记录数
      take: limit,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        user: {
          id: true,
          username: true
        },
        room: {
          id: true,
          name: true,
          location: true
        }
      },
      where: condition
    });
    return {
      records,
      total
    };
  }

  async apply(id: string) {
    await this.entityManager.update(
      Booking,
      {
        id
      },
      {
        status: BOOKING_STATUS.success
      }
    );
    return 'success';
  }

  async reject(id: string) {
    await this.entityManager.update(
      Booking,
      {
        id
      },
      {
        status: BOOKING_STATUS.reject
      }
    );
    return 'success';
  }

  async unbind(id: string) {
    // 方式一

    // await this.entityManager.update(
    //   Booking,
    //   {
    //     id
    //   },
    //   {
    //     status: BOOKING_STATUS.unbind
    //   }
    // );

    // 方式二
    await this.bookingRepository.update(id, { status: BOOKING_STATUS.unbind });
    return 'success';
  }

  async urge(id: string) {
    const flag: string = await this.redisService.get(`urge_${id}`);

    if (flag) {
      return '半小时内只能催办一次，请耐心等待';
    }

    let email: string = await this.redisService.get('admin_email');

    let admin: User = null;

    if (!email) {
      admin = await this.entityManager.findOne(User, {
        select: {
          email: true
        },
        where: {
          isAdmin: true
        }
      });

      email = admin.email;

      this.redisService.set('admin_email', email);
    }

    this.captchaService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `${admin.username} 的预定申请正在等待审批`
    });

    this.redisService.set(`urge_${id}`, id, 60 * 30);

    return '预定申请催办已提交';
  }

  delete(id: string) {
    return this.bookingRepository.delete(id);
  }

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: '30155407-e56e-4371-8dd4-aa6e1a9682cb'
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 'be49af59-be1d-4edc-8db4-723435a12d40'
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: '23a02837-0874-4aea-a7b7-5d05eb6f35cf'
    });
    const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
      id: '3ee23c59-86bf-4a4c-974d-04d66184cd8e'
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }
}
