import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: signInDto.email
      }
    });

    if (!user) {
      throw new NotFoundException();
    }

    const isPasswordCorrect = await compare(signInDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    delete user.password;

    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return {
      user,
      accessToken
    };
  }

  async signUp(signUpDto: SignUpDto) {
    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new UnprocessableEntityException();
    }

    const isEmailAlreadyAssociated = await this.prismaService.user.findUnique({
      where: {
        email: signUpDto.email
      }
    });

    if (isEmailAlreadyAssociated) {
      throw new ConflictException();
    }

    const hashPassword = await hash(signUpDto.password, 10);

    signUpDto.password = hashPassword;
    delete signUpDto.confirmPassword;

    const user = await this.prismaService.user.create({
      data: signUpDto,
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
    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return {
      user,
      accessToken
    };
  }
}
