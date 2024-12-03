import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async getProjects(id: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id
      }
    });

    if (!user) {
      throw new NotFoundException();
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
      throw new NotFoundException();
    }

    const isPasswordCorrect = await compare(updateUserDto.currentPassword, user.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
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
