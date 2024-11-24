import { Controller, UseGuards, Get, Post, HttpCode, Request, Param } from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findOne(@Request() request: { user?: { sub: string } }) {
    const data = await this.usersService.findOne(request.user.sub);

    return {
      data
    };
  }

  @Post('invitations/:projectId')
  @HttpCode(200)
  async acceptProjectInvitation(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string }
  ) {
    await this.usersService.acceptProjectInvitation(request.user.sub, params.projectId);

    return {
      message: 'Project invitation successfully accepted.'
    };
  }
}
