import { Controller, UseGuards, Get, Request } from '@nestjs/common';

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
}
