import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          ...createCategoryDto,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This category name already exists.');
        }
      }
      throw new InternalServerErrorException(
        'Something went wrong while creating the category.',
      );
    }
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.category.findUnique({ where: { id } });
  }

  // UPDATE
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException('Category not found');

      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Another category with this name already exists.',
          );
        }
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  // REMOVE
  async remove(id: string) {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException('Category not found');

      const booksCount = await this.prisma.book.count({
        where: { categoryId: id },
      });

      if (booksCount > 0) {
        throw new BadRequestException(
          'Cannot delete category because it has books associated with it.',
        );
      }

      return await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
