import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../common/database/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { AddTaskDto } from './dto/add-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InsufficientPermissionsException } from '../common/http/exceptions/insufficient-permissions.exception';
import { ProjectNotFoundException } from '../common/http/exceptions/project-not-found.exception';

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
      throw new NotFoundException('User not found.');
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
      throw new ProjectNotFoundException();
    }

    if (project.startedAt && project.status === 'ACTIVE') {
      throw new ConflictException('Project already started.');
    }

    const hasPermission = await this.isProjectOwner(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
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

  async update(projectId: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const isProjectOwnerOrAdmin = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!isProjectOwnerOrAdmin) {
      throw new InsufficientPermissionsException();
    }

    const updatedProject = await this.prismaService.project.update({
      data: updateProjectDto,
      where: {
        id: project.id
      }
    });

    return {
      project: updatedProject
    };
  }

  async addTask(projectId: string, addTaskDto: AddTaskDto, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
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

  async inviteUsers(projectId: string, inviteUsersDto: InviteUsersDto, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const membersData = await this.prepareMembersData(project.id, inviteUsersDto.usersList);

    await this.prismaService.projectMember.createMany({ data: membersData });
  }

  async delete(projectId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwner(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    await this.prismaService.project.delete({
      where: {
        id: project.id
      }
    });
  }

  async updateMemberRole(
    projectId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
    userId: string
  ) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const projectMember = await this.prismaService.projectMember.findFirst({
      where: {
        id: updateMemberRoleDto.memberId
      }
    });

    if (!projectMember) {
      throw new NotFoundException('Member not found.');
    }

    const updatedProjectMember = await this.prismaService.projectMember.update({
      data: {
        role: updateMemberRoleDto.newRole
      },
      where: {
        id: projectMember.id
      }
    });

    return {
      projectMember: updatedProjectMember
    };
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const projectMember = await this.prismaService.projectMember.findFirst({
      where: {
        id: memberId
      }
    });

    if (!projectMember) {
      throw new NotFoundException('Member not found.');
    }

    await this.prismaService.projectMember.delete({
      where: {
        id: memberId
      }
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
    userId: string
  ) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const updatedTask = await this.prismaService.task.update({
      data: updateTaskDto,
      where: {
        id: taskId
      }
    });

    return {
      task: updatedTask
    };
  }

  async startTask(projectId: string, taskId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectMember(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const task = await this.prismaService.task.findFirst({
      where: {
        id: taskId
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    if (task.status !== 'PENDING') {
      throw new ConflictException('Task already started.');
    }

    await this.prismaService.task.update({
      data: {
        startedAt: new Date(),
        status: 'ACTIVE'
      },
      where: {
        id: task.id
      }
    });
  }

  async completeTask(projectId: string, taskId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectMember(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const task = await this.prismaService.task.findFirst({
      where: {
        id: taskId
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    if (task.status === 'COMPLETED') {
      throw new ConflictException('Task already completed.');
    }

    await this.prismaService.task.update({
      data: {
        completedAt: new Date(),
        status: 'COMPLETED'
      },
      where: {
        id: task.id
      }
    });
  }

  async deleteTask(projectId: string, taskId: string, userId: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        id: projectId
      }
    });

    if (!project) {
      throw new ProjectNotFoundException();
    }

    const hasPermission = await this.isProjectOwnerOrAdmin(projectId, userId);

    if (!hasPermission) {
      throw new InsufficientPermissionsException();
    }

    const task = await this.prismaService.task.findFirst({
      where: {
        id: taskId
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    await this.prismaService.task.delete({
      where: {
        id: taskId
      }
    });
  }

  private async isProjectOwner(projectId: string, userId: string) {
    const hasPermission = await this.prismaService.projectMember.findFirst({
      where: {
        projectId,
        userId,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });

    return !!hasPermission;
  }

  private async isProjectOwnerOrAdmin(projectId: string, userId: string) {
    const hasPermission = await this.prismaService.projectMember.findFirst({
      where: {
        projectId,
        userId,
        role: {
          in: ['OWNER', 'ADMIN']
        },
        status: 'ACTIVE'
      }
    });

    return !!hasPermission;
  }

  private async isProjectMember(projectId: string, userId: string) {
    const hasPermission = await this.prismaService.projectMember.findFirst({
      where: {
        projectId,
        userId,
        status: 'ACTIVE'
      }
    });

    return !!hasPermission;
  }

  private async prepareMembersData(projectId: string, usersList: { email: string; role: Role }[]) {
    return Promise.all(
      usersList.map(async (user) => {
        const foundUser = await this.prismaService.user.findUnique({
          where: { email: user.email }
        });

        if (!foundUser) {
          throw new NotFoundException('User not found.');
        }

        return {
          projectId,
          userId: foundUser.id,
          role: user.role
        };
      })
    );
  }
}
