import {
  Controller,
  UseGuards,
  Get,
  Post,
  HttpCode,
  Request,
  Param,
  Patch,
  Body
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestDto } from 'src/common/http/dto/request.dto';
import { UserParamsDto } from './dto/user-params.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findOne(@Request() request: RequestDto) {
    const data = await this.usersService.findOne(request.user.sub);

    return {
      data
    };
  }

  @Get('projects')
  async getProjects(@Request() request: RequestDto) {
    const data = await this.usersService.getProjects(request.user.sub);

    return {
      data
    };
  }

  @Patch()
  async updatePassword(@Request() request: RequestDto, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.updatePassword(request.user.sub, updateUserDto);

    return {
      message: 'Password successfully updated.'
    };
  }

  @Post('invitations/:projectId')
  @HttpCode(200)
  async acceptProjectInvitation(@Request() request: RequestDto, @Param() params: UserParamsDto) {
    await this.usersService.acceptProjectInvitation(request.user.sub, params.projectId);

    return {
      message: 'Project invitation successfully accepted.'
    };
  }
}
