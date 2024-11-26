import { Controller, Post, Body, Request, UseGuards, HttpCode, Param, Patch } from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddTaskDto } from './dto/add-task.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InviteUsersDto } from './dto/invite-users.dto';

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
    @Param() params: { projectId: string },
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const data = await this.projectsService.update(
      request.user.sub,
      params.projectId,
      updateProjectDto
    );

    return {
      data,
      message: 'Project details successfully updated.'
    };
  }

  @Post(':id/tasks')
  async addTask(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string },
    @Body() addTaskDto: AddTaskDto
  ) {
    const data = await this.projectsService.addTask(params.projectId, request.user.sub, addTaskDto);

    return {
      data,
      message: 'Task successfully added to the project.'
    };
  }

  @Post(':id/invite')
  @HttpCode(200)
  async inviteUsers(
    @Request() request: { user: { sub: string } },
    @Param() params: { projectId: string },
    @Body() inviteUsersDto: InviteUsersDto
  ) {
    await this.projectsService.inviteUsers(params.projectId, request.user.sub, inviteUsersDto);

    return {
      message: 'Invitations successfully sent.'
    };
  }
}
