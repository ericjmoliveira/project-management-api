import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  Param,
  Patch,
  Delete
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddTaskDto } from './dto/add-task.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InviteUsersDto } from './dto/invite-users.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @Request() request: { user: { sub: string } },
    @Body() createProjectDto: CreateProjectDto
  ) {
    const data = await this.projectsService.create(request.user.sub, createProjectDto);

    return {
      data,
      message: 'Project successfully created.'
    };
  }

  @Post(':id/start')
  @HttpCode(200)
  async start(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string }
  ) {
    const data = await this.projectsService.start(params.projectId, request.user.sub);

    return {
      data,
      message: 'Project successfully started.'
    };
  }

  @Patch(':id')
  async update(
    @Request() request: { user: { sub: string } },
    @Param() params: { id: string },
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const data = await this.projectsService.update(request.user.sub, params.id, updateProjectDto);

    return {
      data,
      message: 'Project details successfully updated.'
    };
  }

  @Post(':id/tasks')
  async addTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { id: string },
    @Body() addTaskDto: AddTaskDto
  ) {
    const data = await this.projectsService.addTask(params.id, request.user.sub, addTaskDto);

    return {
      data,
      message: 'Task successfully added to the project.'
    };
  }

  @Patch(':projectId/tasks/:taskId')
  async updateTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string; taskId: string },
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    const data = await this.projectsService.updateTask(
      params.projectId,
      params.taskId,
      request.user.sub,
      updateTaskDto
    );

    return {
      data,
      message: 'Task details successfully updated.'
    };
  }

  @Post(':projectId/tasks/:taskId/start')
  async startTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string; taskId: string }
  ) {
    await this.projectsService.startTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully started.'
    };
  }

  @Post(':projectId/tasks/:taskId/complete')
  async completeTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string; taskId: string }
  ) {
    await this.projectsService.completeTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully completed.'
    };
  }

  @Delete(':projectId/tasks/:taskId')
  async deleteTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string; taskId: string }
  ) {
    await this.projectsService.deleteTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully deleted.'
    };
  }

  @Post(':id/invite')
  @HttpCode(200)
  async inviteUsers(
    @Request() request: { user: { sub: string } },
    @Param() params: { id: string },
    @Body() inviteUsersDto: InviteUsersDto
  ) {
    await this.projectsService.inviteUsers(params.id, request.user.sub, inviteUsersDto);

    return {
      message: 'Invitations successfully sent.'
    };
  }

  @Patch(':id/members')
  async updateMemberRole(
    @Request() request: { user: { sub: string } },
    @Param() params: { id: string },
    @Body() updateMemberRoleDto: UpdateMemberRoleDto
  ) {
    const data = await this.projectsService.updateMemberRole(
      params.id,
      request.user.sub,
      updateMemberRoleDto
    );

    return {
      data,
      message: 'Member role successfully updated.'
    };
  }

  @Delete(':projectId/members/:memberId')
  async removeMember(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string; memberId: string }
  ) {
    const data = await this.projectsService.removeMember(
      params.projectId,
      request.user.sub,
      params.memberId
    );

    return {
      message: 'Member successfully removed.'
    };
  }

  @Delete(':id')
  async delete(@Request() request: { user: { sub: string } }, @Param() params: { id: string }) {
    const data = await this.projectsService.delete(params.id, request.user.sub);

    return {
      data,
      message: 'Project successfully deleted.'
    };
  }
}
