import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe
} from '@nestjs/common';

import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { BookingService } from '@/services/booking.service';
import { CreateBookingDto } from '@/dtos/create-booking.dto';

import { generateParseIntPipe } from '@/common/pipe/common.pipe';
import { RequireLogin, UserInfo } from '@/common/decorator/custom.decorator';

@ApiTags('预定模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('add')
  @RequireLogin()
  @ApiOperation({
    summary: '添加预定'
  })
  async create(
    @Body() createBooking: CreateBookingDto,
    @UserInfo() userId: string
  ) {
    try {
      await this.bookingService.create(createBooking, userId);
      return 'success';
    } catch (error) {
      return 'error';
    }
  }

  @Get('list')
  @RequireLogin()
  @ApiOperation({
    summary: '预定列表'
  })
  getBookingList(
    @Query('page', new DefaultValuePipe(1), generateParseIntPipe('page'))
    page: number,
    @Query('limit', new DefaultValuePipe(2), generateParseIntPipe('limit'))
    limit: number,
    @Query('status') status: string,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('location') location: string,
    @Query('bookingTime') bookingTime: Array<string>
  ) {
    return this.bookingService.getBookingList(
      page,
      limit,
      status,
      username,
      meetingRoomName,
      location,
      bookingTime
    );
  }

  @Get('apply/:id')
  @RequireLogin()
  @ApiOperation({
    summary: '通过预定'
  })
  async apply(@Param('id') id: string) {
    return this.bookingService.apply(id);
  }

  @Get('reject/:id')
  @RequireLogin()
  @ApiOperation({
    summary: '拒绝预定'
  })
  async reject(@Param('id') id: string) {
    return this.bookingService.reject(id);
  }

  @Get('unbind/:id')
  @RequireLogin()
  @ApiOperation({
    summary: '解绑预定'
  })
  async unbind(@Param('id') id: string) {
    return this.bookingService.unbind(id);
  }

  @Get('urge:id')
  @RequireLogin()
  @ApiOperation({
    summary: '催办预定'
  })
  urge(@Param('id') id: string) {
    return this.bookingService.urge(id);
  }

  // TODO
  @Get('delete:id')
  @RequireLogin()
  @ApiOperation({
    summary: '删除预定'
  })
  findOne(@Param('id') id: string) {
    return this.bookingService.delete(id);
  }
}
