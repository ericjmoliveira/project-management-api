import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from './users.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('../common/prisma/prisma.service');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prismaService = {
      project: {
        findFirst: jest.fn()
      },
      projectMember: {
        findFirst: jest.fn(),
        update: jest.fn()
      },
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn()
      }
    } as unknown as jest.Mocked<PrismaService>;

    service = new UsersService(prismaService);
  });

  describe('acceptProjectInvitation', () => {
    it('should throw ConflictException if the user is already a member of the project', async () => {
      const mockMemberData = {
        id: '1',
        userId: '1',
        projectId: '1',
        status: 'ACTIVE',
        joinedAt: new Date()
      };
      const mockProject = {
        id: '1',
        name: 'Project 1',
        ownerId: '1'
      };

      (prismaService.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
      (prismaService.projectMember.findFirst as jest.Mock).mockResolvedValue(mockMemberData);

      await expect(service.acceptProjectInvitation('1', '1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if the project does not exist', async () => {
      const mockMemberData = {
        id: '1',
        userId: '1',
        projectId: '1',
        status: 'PENDING',
        joinedAt: null
      };

      (prismaService.project.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.projectMember.findFirst as jest.Mock).mockResolvedValue(mockMemberData);

      await expect(service.acceptProjectInvitation('1', '1')).rejects.toThrow(NotFoundException);
    });

    it('should successfully accept invitation and update member status to ACTIVE', async () => {
      const mockMemberData = {
        id: '1',
        userId: '1',
        projectId: '1',
        status: 'PENDING',
        joinedAt: null
      };
      const mockProject = {
        id: '1',
        name: 'Project 1',
        ownerId: '1'
      };

      (prismaService.project.findFirst as jest.Mock).mockResolvedValue(mockProject);
      (prismaService.projectMember.findFirst as jest.Mock).mockResolvedValue(mockMemberData);
      (prismaService.projectMember.update as jest.Mock).mockResolvedValue({
        ...mockMemberData,
        status: 'ACTIVE',
        joinedAt: new Date()
      });

      await service.acceptProjectInvitation('1', '1');

      expect(prismaService.projectMember.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ACTIVE', joinedAt: expect.any(Date) },
          where: { id: '1' }
        })
      );
    });
  });
});
