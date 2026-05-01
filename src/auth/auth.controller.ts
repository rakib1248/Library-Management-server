import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  AuthorDto,
  LoginAuthDto,
  RegisterAuthDto,
} from './dto/create-auth.dto';

import type { Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from './decorators/user.decorator';
import type { AuthUser } from './types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    return result;
  }

  /**
   * Note: The register endpoint does not set a cookie or return a token.
   */
  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authService.register(registerDto);
  }

  @Post('author')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  async authoe(@Body() author: AuthorDto, @CurrentUser() user: AuthUser) {
    return await this.authService.authorCreate(author, user.sub);
  }
}
