import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

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

  async acceptProjectInvitation(userId: string, projectId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new NotFoundException();
    }

    const memberData = await this.prismaService.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId
      }
    });

    if (memberData.joinedAt && memberData.status === 'ACTIVE') {
      throw new ConflictException();
    }

    await this.prismaService.projectMember.update({
      data: {
        status: 'ACTIVE',
        joinedAt: new Date()
      },
      where: {
        id: memberData.id
      }
    });
  }
}
