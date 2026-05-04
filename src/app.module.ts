import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
import { CategoryModule } from './category/category.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    BooksModule,

    CategoryModule,

    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
