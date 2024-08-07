import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';

// 用 PickType 来复用 name、location 和 capacity 字段：
export class UpdateMeetingRoomDto extends PickType(CreateMeetingRoomDto, [
  'name',
  'location',
  'capacity'
]) {
  @ApiProperty()
  @IsNotEmpty({
    message: 'id 不能为空'
  })
  id: string;

  @ApiProperty()
  @MaxLength(50, {
    message: '设备最长为 50 字符'
  })
  equipment: string;

  @ApiProperty()
  @MaxLength(100, {
    message: '描述最长为 100 字符'
  })
  description: string;
}
