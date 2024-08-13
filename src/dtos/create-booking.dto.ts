import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'meetingRoomId', default: '', type: String })
  meetingRoomId: string;

  @ApiProperty({ description: 'bookingTime', default: '', type: Array })
  @IsNotEmpty({
    message: '时间不能为空'
  })
  bookingTime: Array<string>;
}
