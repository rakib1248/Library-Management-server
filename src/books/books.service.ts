import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUser } from '@/auth/types/auth-user.type';
import { Role } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto, user: AuthUser) {
    const author = await this.prisma.author.findUnique({
      where: { userId: user.sub },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found.');
    }

    try {
      return await this.prisma.book.create({
        data: {
          ...createBookDto,
          authorId: author.id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A book with this ISBN already exists.');
        }
      }

      throw new InternalServerErrorException(
        'Something went wrong while creating the book',
      );
    }
  }

  async findAll() {
    return await this.prisma.book.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.book.findUnique({ where: { id } });
  }

  async update(id: string, updateBookDto: UpdateBookDto, user: AuthUser) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const isOwner = book.author.userId === user.sub;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to update this book',
      );
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('ISBN already exists in another book');
        }
      }
      throw new InternalServerErrorException('Failed to update book');
    }
  }

  async remove(id: string, user: AuthUser) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const isOwner = book.author.userId === user.sub;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to update this book',
      );
    }

    try {
      return await this.prisma.book.delete({ where: { id } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('ISBN already exists in another book');
        }
      }
      throw new InternalServerErrorException('Failed to update book');
    }
  }
}
