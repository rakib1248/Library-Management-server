import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { TransactionStatus, TransactionType } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async buyBook(bookId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new NotFoundException('Book not found');
      if (book.stockCount <= 0)
        throw new BadRequestException('Book is out of stock');

      const transaction = await tx.transaction.create({
        data: {
          studentId: userId,
          bookId: bookId,
          type: TransactionType.PURCHASE, // তোমার enum অনুযায়ী
          status: TransactionStatus.COMPLETED,
          amount: book.purchasePrice,
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { stockCount: { decrement: 1 } },
      });

      return transaction;
    });
  }

  async rentBook(bookId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({ where: { id: bookId } });
      if (!book) throw new NotFoundException('Book not found');
      if (book.stockCount <= 0)
        throw new BadRequestException('Book is out of stock');

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const transaction = await tx.transaction.create({
        data: {
          studentId: userId,
          bookId: bookId,
          type: TransactionType.RENT,
          status: TransactionStatus.ACTIVE,
          amount: book.rentPrice,
          rentStartDate: new Date(),
          dueDate: dueDate,
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { stockCount: { decrement: 1 } },
      });

      return transaction;
    });
  }
  async getMyBooks(userId: string) {
    return this.prisma.transaction.findMany({
      where: { studentId: userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });
  }

  // create(createBookingDto: CreateBookingDto) {
  //   return 'This action adds a new booking';
  // }

  // findAll() {
  //   return `This action returns all booking`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} booking`;
  // }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} booking`;
  // }
}
