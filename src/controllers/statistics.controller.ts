import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from '@/services/statistics.service';

import { RequireLogin } from '@/common/decorator/custom.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('userBookingCount')
  @RequireLogin()
  async userBookingCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.statisticsService.userBookingCount(startTime, endTime);
  }

  @Get('meetingRoomUsedCount')
  @RequireLogin()
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.statisticsService.meetingRoomUsedCount(startTime, endTime);
  }
}
