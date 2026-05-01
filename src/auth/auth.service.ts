import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthorDto,
  LoginAuthDto,
  RegisterAuthDto,
} from './dto/create-auth.dto';

import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password, ipAddress, deviceOs, browser } = loginAuthDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress,
        deviceOs,
        browser,
      },
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      sessionId: session.id,
      role: user.role,
    });
    if (!token) {
      throw new UnauthorizedException('Failed to generate token');
    }
    // Store the token in the Cookie (if needed) or return it in the response

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterAuthDto) {
    const { name, email, password, role } = registerDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || Role.STUDENT,
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async authorCreate(author: AuthorDto, userId: string) {
    console.log({ ...author, userId });
    try {
      return await this.prisma.author.create({
        data: {
          ...author,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Author profile already exists for this user',
          );
        }
      }

      throw new InternalServerErrorException('Failed to create author profile');
    }
  }
}
