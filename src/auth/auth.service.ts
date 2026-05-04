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
import { Request } from 'express';
import * as geoip from 'geoip-lite';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginAuthDto: LoginAuthDto, req: Request) {
    const { email, password } = loginAuthDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const ipAddress =
      req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const geo = geoip.lookup(ipAddress);

    const locationName = geo
      ? `${geo.city}, ${geo.country}`
      : 'Localhost / Unknown';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    let browserName = 'Unknown';
    if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('SamsungBrowser'))
      browserName = 'Samsung Internet';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR'))
      browserName = 'Opera';
    else if (userAgent.includes('Edge') || userAgent.includes('Edg'))
      browserName = 'Edge';
    else if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Safari')) browserName = 'Safari';

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        ipAddress:
          req.ip || req.headers['x-forwarded-for']?.toString() || 'Unknown',
        deviceOs: userAgent,
        browser: browserName,
        location: locationName,
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

  async getMyProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        authors: { select: { id: true, name: true, bio: true, status: true } },
        transactions: {
          select: {
            amount: true,
            status: true,

            rentStartDate: true,

            book: { select: { title: true } },
          },
        },
      },
    });
  }

  async getMySession(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logout(sessionId: string) {
    return this.prisma.session.delete({ where: { id: sessionId } });
  }

  async logoutAll(userId: string) {
    return this.prisma.session.deleteMany({ where: { userId } });
  }
}
