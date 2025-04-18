import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AuthController } from './auth.controller';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.SECRET,
        signOptions: { expiresIn: '60m' },
      }),
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy,Repository],
  exports: [AuthService],
controllers: [AuthController],
})
export class AuthModule {}