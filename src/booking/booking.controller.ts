import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';

import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('buy/:bookId')
  @UseGuards(AuthGuard)
  @Roles(Role.STUDENT)
  async buy(@Param('bookId') bookId: string, @CurrentUser() user: AuthUser) {
    return this.bookingService.buyBook(bookId, user.sub);
  }

  @Post('rent/:bookId')
  @UseGuards(AuthGuard)
  @Roles(Role.STUDENT)
  async rent(@Param('bookId') bookId: string, @CurrentUser() user: AuthUser) {
    return this.bookingService.rentBook(bookId, user.sub);
  }
}
