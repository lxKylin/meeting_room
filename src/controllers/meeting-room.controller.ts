import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';

import { MeetingRoomService } from '../services/meeting-room.service';
import { CreateMeetingRoomDto } from '@/dtos/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from '@/dtos/update-meeting-room.dto';

import { generateParseIntPipe } from '@/common/pipe/common.pipe';
import { RequireLogin, UserInfo } from '@/common/decorator/custom.decorator';

@ApiTags('会议室模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post('create')
  @ApiOperation({
    summary: '创建会议室'
  })
  @RequireLogin()
  @ApiBearerAuth()
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(createMeetingRoomDto);
  }

  @Get('list')
  @ApiOperation({
    summary: '列表' // 接口描述信息
  })
  @RequireLogin()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    description: '第几页',
    type: Number,
    required: false
  })
  @ApiQuery({
    name: 'limit',
    description: '每页多少条',
    type: Number,
    required: false
  })
  @ApiQuery({
    name: 'name',
    description: '会议室名称',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'location',
    description: '位置',
    type: String,
    required: false
  })
  @ApiQuery({
    name: 'isBooked',
    description: '是否预定',
    type: String,
    required: false
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), generateParseIntPipe('page'))
    page: number,
    @Query('limit', new DefaultValuePipe(2), generateParseIntPipe('limit'))
    limit: number,
    @Query('name') name: string,
    @Query('location') location: string,
    @Query('isBooked') isBooked: boolean
  ) {
    return this.meetingRoomService.findAll(
      page,
      limit,
      name,
      location,
      isBooked
    );
  }

  @Get(':id')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '根据id查询会议室'
  })
  findOne(@Param('id') id: string) {
    return this.meetingRoomService.findOneById(id);
  }

  @Patch('update')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新会议室信息'
  })
  async update(@Body() updateMeetingRoom: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(updateMeetingRoom);
  }

  @Delete(':id')
  @RequireLogin()
  @ApiBearerAuth()
  @ApiOperation({
    summary: '删除会议室'
  })
  remove(@Param('id') id: string) {
    return this.meetingRoomService.remove(id);
  }
}
