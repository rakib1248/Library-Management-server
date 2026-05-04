import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import { CurrentUser } from '@/auth/decorators/user.decorator';
import type { AuthUser } from '@/auth/types/auth-user.type';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  create(@Body() createBookDto: CreateBookDto, @CurrentUser() user: AuthUser) {
    return this.booksService.create(createBookDto, user);
  }

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.booksService.update(id, updateBookDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.booksService.remove(id, user);
  }

  @Get('/seller/my-books')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  getMyBooks(@CurrentUser() user: AuthUser) {
    return this.booksService.getMyBooks(user);
  }
}
