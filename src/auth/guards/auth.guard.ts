/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector, // মেটাডাটা রিড করার জন্য
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { cookies?: { accessToken?: string } }>();

    // ১. টোকেন চেক (Cookie থেকে)
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Please login to access this resource');
    }

    try {
      // ২. টোকেন ভেরিফাই
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request['user'] = payload; // রিকোয়েস্টে ইউজার ডাটা সেট করা

      // ৩. রোল চেক (যদি রাউটে রোল ডিফাইন করা থাকে)
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );

      // যদি রাউটে কোনো রোল না চায়, তবে শুধু লগইন থাকলেই হবে
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // যদি রোল চায়, তবে ইউজারের রোল আছে কি না চেক করো
      if (!requiredRoles.includes(payload.role)) {
        throw new ForbiddenException(`Access denied for ${payload.role} role`);
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
