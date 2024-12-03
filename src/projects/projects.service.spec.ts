import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../common/prisma/prisma.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn()
    },
    project: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    projectMember: {
      create: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    task: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-id', { name: 'Project 1', description: 'Test project' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a project with required properties', async () => {
      const user = { id: 'user-id', email: 'user@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const createdProject = {
        id: 'project-id',
        name: 'Project 1',
        description: 'Test project',
        ownerId: user.id,
        status: 'INACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPrismaService.project.create.mockResolvedValue(createdProject);
      mockPrismaService.projectMember.create.mockResolvedValue({});

      const result = await service.create('user-id', {
        name: 'Project 1',
        description: 'Test project'
      });

      expect(result.project).toEqual(createdProject);
      expect(mockPrismaService.project.create).toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('should throw NotFoundException if project does not exist', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(null);

      await expect(service.start('project-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue({
        id: 'project-id',
        status: 'INACTIVE'
      });
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null);

      await expect(service.start('project-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if project is already started', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue({
        id: 'project-id',
        status: 'ACTIVE',
        startedAt: new Date()
      });

      await expect(service.start('project-id', 'user-id')).rejects.toThrow(ConflictException);
    });

    it('should start the project with necessary updates', async () => {
      const project = {
        id: 'project-id',
        name: 'Project 1',
        status: 'INACTIVE',
        startedAt: null
      };
      mockPrismaService.project.findFirst.mockResolvedValue(project);
      mockPrismaService.projectMember.findFirst.mockResolvedValue({ id: 'project-member-id' });

      const updatedProject = { ...project, status: 'ACTIVE', startedAt: new Date() };
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.start('project-id', 'user-id');

      expect(result.project.status).toBe('ACTIVE');
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        data: { status: 'ACTIVE', startedAt: expect.any(Date) },
        where: { id: 'project-id' }
      });
    });
  });

  describe('inviteUsers', () => {
    it('should throw NotFoundException if project does not exist', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue(null);

      await expect(
        service.inviteUsers(
          'project-id',
          { usersList: [{ email: 'user@example.com', role: 'ADMIN' }] },
          'user-id'
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue({ id: 'project-id' });
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null);

      await expect(
        service.inviteUsers(
          'project-id',
          { usersList: [{ email: 'user@example.com', role: 'ADMIN' }] },
          'user-id'
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should invite users to the project', async () => {
      mockPrismaService.project.findFirst.mockResolvedValue({ id: 'project-id' });
      mockPrismaService.projectMember.findFirst.mockResolvedValue({});
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com'
      });
      mockPrismaService.projectMember.createMany.mockResolvedValue({ count: 1 });

      await service.inviteUsers(
        'project-id',
        { usersList: [{ email: 'user@example.com', role: 'ADMIN' }] },
        'user-id'
      );

      expect(mockPrismaService.projectMember.createMany).toHaveBeenCalled();
    });
  });
});
