import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { PrismaService } from '../common/database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from '../common/http/exceptions/user-not-found.exception';
import { InvalidCredentialsException } from '../common/http/exceptions/invalid-credentials.exception';
import { ProjectNotFoundException } from '../common/http/exceptions/project-not-found.exception';

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
      throw new UserNotFoundException();
    }

    return {
      user
    };
  }

  async getProjects(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id
      }
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const ownedProjects = await this.prismaService.project.findMany({
      where: {
        ownerId: id
      }
    });

    const memberListing = await this.prismaService.projectMember.findMany({
      where: {
        userId: id,
        role: { notIn: ['OWNER'] }
      },
      include: {
        project: true
      }
    });

    return {
      ownedProjects,
      joinedProjects: memberListing.map((project) => project.project)
    };
  }

  async updatePassword(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id
      }
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordCorrect = await compare(updateUserDto.currentPassword, user.password);

    if (!isPasswordCorrect) {
      throw new InvalidCredentialsException();
    }

    delete updateUserDto.currentPassword;

    const hashPassword = await hash(updateUserDto.newPassword, 10);

    await this.prismaService.user.update({
      data: {
        password: hashPassword
      },
      where: {
        id
      }
    });
  }

  async acceptProjectInvitation(userId: string, projectId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const memberData = await this.prismaService.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId
      }
    });

    if (!memberData) {
      throw new NotFoundException('Member not found.');
    }

    if (memberData.joinedAt && memberData.status === 'ACTIVE') {
      throw new ConflictException('Invitation already accepted.');
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
