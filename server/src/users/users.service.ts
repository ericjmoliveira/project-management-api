import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: false,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      user
    };
  }
}
