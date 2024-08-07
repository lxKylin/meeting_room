import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingRoomDto {
  @ApiProperty({ description: 'id', default: '', type: String })
  id: string;

  @ApiProperty({ description: '会议室名称', default: '', type: String })
  @IsNotEmpty({
    message: '会议室名称不能为空'
  })
  name: string;

  @ApiProperty({ description: '会议室容量', default: '', type: Number })
  @IsNotEmpty({
    message: '会议室容量不能为空'
  })
  capacity: number;

  @ApiProperty({ description: '会议室位置', default: '', type: String })
  @IsNotEmpty({
    message: '会议室位置不能为空'
  })
  location: string;

  @ApiProperty({ description: '会议室设备', default: '', type: String })
  equipment: string;

  @ApiProperty({ description: '描述', default: '', type: String })
  description: string;
}
