import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTaskDto } from './dto/add-task.dto';
import { Priority } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw new NotFoundException();
    }

    const project = await this.prismaService.project.create({
      data: {
        ownerId: userId,
        ...createProjectDto
      }
    });

    await this.prismaService.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date()
      }
    });

    return {
      project
    };
  }

  async start(projectId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new NotFoundException();
    }

    const isProjectOwner = await this.prismaService.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId,
        role: 'OWNER'
      }
    });

    if (!isProjectOwner) {
      throw new ForbiddenException();
    }

    if (project.startedAt && project.status === 'ACTIVE') {
      throw new ConflictException();
    }

    const updatedProject = await this.prismaService.project.update({
      data: {
        startedAt: new Date(),
        status: 'ACTIVE'
      },
      where: {
        id: project.id
      }
    });

    return {
      project: updatedProject
    };
  }

  async addTask(projectId: string, userId: string, addTaskDto: AddTaskDto) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new NotFoundException();
    }

    const isProjectOwnerOrAdmin = await this.prismaService.projectMember.findFirst({
      where: {
        projectId: project.id,
        userId,
        role: {
          in: ['OWNER', 'ADMIN']
        }
      }
    });

    if (!isProjectOwnerOrAdmin) {
      throw new ForbiddenException();
    }

    const task = await this.prismaService.task.create({
      data: {
        projectId: project.id,
        ...addTaskDto
      }
    });

    return {
      task
    };
  }
}
