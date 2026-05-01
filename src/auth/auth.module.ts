import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ১. নিশ্চিত করো ConfigModule এখানে আছে (অথবা AppModule এ global: true করা আছে)
    JwtModule.registerAsync({
      global: true, // পুরো অ্যাপে JwtService ব্যবহার করতে পারবে
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ConfigService দিয়ে সিক্রেট নাও
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // দরকার হতে পারে অন্য মডিউলে
})
export class AuthModule {}
