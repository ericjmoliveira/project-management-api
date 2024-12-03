import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaServiceMock: PrismaService;
  let jwtServiceMock: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn()
            }
          }
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaServiceMock = module.get(PrismaService);
    jwtServiceMock = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      (prismaServiceMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };
      await expect(service.signIn(signInDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      (prismaServiceMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'clgjs34hsbjd', // Simulated CUID string
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      (compare as jest.Mock).mockResolvedValue(false);

      const signInDto: SignInDto = { email: 'test@example.com', password: 'wrongPassword' };
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and accessToken on successful sign-in', async () => {
      const mockUser = {
        id: 'clgjs34hsbjd',
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      (prismaServiceMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('testAccessToken');

      const signInDto: SignInDto = { email: 'test@example.com', password: 'password' };
      const result = await service.signIn(signInDto);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({ sub: 'clgjs34hsbjd' });
      expect(result).toEqual({
        user: { id: 'clgjs34hsbjd', email: 'test@example.com' },
        accessToken: 'testAccessToken'
      });
    });
  });

  describe('signUp', () => {
    it('should throw UnprocessableEntityException if passwords do not match', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'differentPassword',
        firstName: 'John',
        lastName: 'Doe'
      };

      await expect(service.signUp(signUpDto)).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException if email is already associated', async () => {
      (prismaServiceMock.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'clgjs34hsbjd',
        email: 'test@example.com'
      });

      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        firstName: 'John',
        lastName: 'Doe'
      };

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user and return user with accessToken', async () => {
      (prismaServiceMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaServiceMock.user.create as jest.Mock).mockResolvedValue({
        id: 'clgjs34hsbjd', // CUID id mock
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('testAccessToken');

      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        confirmPassword: 'password',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await service.signUp(signUpDto);

      expect(hash).toHaveBeenCalledWith('password', 10);
      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword',
          firstName: 'John',
          lastName: 'Doe'
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
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({ sub: 'clgjs34hsbjd' });
      expect(result).toEqual({
        user: {
          id: 'clgjs34hsbjd',
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        },
        accessToken: 'testAccessToken'
      });
    });
  });
});
