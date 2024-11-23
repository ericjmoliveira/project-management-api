import { Controller, Post, Body, Request, UseGuards, HttpCode, Param } from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';

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
}
