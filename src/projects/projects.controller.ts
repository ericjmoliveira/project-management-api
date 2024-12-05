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
import { AuthGuard } from '../auth/auth.guard';
import { RequestDto } from '../common/http/dto/request.dto';
import { ProjectParamsDto } from './dto/project-params.dto';
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
  async create(@Request() request: RequestDto, @Body() createProjectDto: CreateProjectDto) {
    const data = await this.projectsService.create(request.user.sub, createProjectDto);

    return {
      data,
      message: 'Project successfully created.'
    };
  }

  @Post(':projectId/start')
  @HttpCode(200)
  async start(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    const data = await this.projectsService.start(params.projectId, request.user.sub);

    return {
      data,
      message: 'Project successfully started.'
    };
  }

  @Patch(':projectId')
  async update(
    @Request() request: RequestDto,
    @Param() params: ProjectParamsDto,
    @Body() updateProjectDto: UpdateProjectDto
  ) {
    const data = await this.projectsService.update(
      params.projectId,
      updateProjectDto,
      request.user.sub
    );

    return {
      data,
      message: 'Project details successfully updated.'
    };
  }

  @Post(':projectId/tasks')
  async addTask(
    @Request() request: RequestDto,
    @Param() params: ProjectParamsDto,
    @Body() addTaskDto: AddTaskDto
  ) {
    const data = await this.projectsService.addTask(params.projectId, addTaskDto, request.user.sub);

    return {
      data,
      message: 'Task successfully added to the project.'
    };
  }

  @Patch(':projectId/tasks/:taskId')
  async updateTask(
    @Request() request: RequestDto,
    @Param() params: ProjectParamsDto,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    const data = await this.projectsService.updateTask(
      params.projectId,
      params.taskId,
      updateTaskDto,
      request.user.sub
    );

    return {
      data,
      message: 'Task details successfully updated.'
    };
  }

  @Post(':projectId/tasks/:taskId/start')
  @HttpCode(200)
  async startTask(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    await this.projectsService.startTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully started.'
    };
  }

  @Post(':projectId/tasks/:taskId/complete')
  @HttpCode(200)
  async completeTask(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    await this.projectsService.completeTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully completed.'
    };
  }

  @Delete(':projectId/tasks/:taskId')
  async deleteTask(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    await this.projectsService.deleteTask(params.projectId, params.taskId, request.user.sub);

    return {
      message: 'Task successfully deleted.'
    };
  }

  @Post(':projectId/invite')
  @HttpCode(200)
  async inviteUsers(
    @Request() request: RequestDto,
    @Param() params: ProjectParamsDto,
    @Body() inviteUsersDto: InviteUsersDto
  ) {
    await this.projectsService.inviteUsers(params.projectId, inviteUsersDto, request.user.sub);

    return {
      message: 'Invitations successfully sent.'
    };
  }

  @Patch(':projectId/members')
  async updateMemberRole(
    @Request() request: RequestDto,
    @Param() params: ProjectParamsDto,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto
  ) {
    const data = await this.projectsService.updateMemberRole(
      params.projectId,
      updateMemberRoleDto,
      request.user.sub
    );

    return {
      data,
      message: 'Member role successfully updated.'
    };
  }

  @Delete(':projectId/members/:memberId')
  async removeMember(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    await this.projectsService.removeMember(params.projectId, params.memberId, request.user.sub);

    return {
      message: 'Member successfully removed.'
    };
  }

  @Delete(':projectId')
  async delete(@Request() request: RequestDto, @Param() params: ProjectParamsDto) {
    const data = await this.projectsService.delete(params.projectId, request.user.sub);

    return {
      data,
      message: 'Project successfully deleted.'
    };
  }
}
