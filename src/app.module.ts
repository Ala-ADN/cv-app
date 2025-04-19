import { TypeOrmModule } from '@nestjs/typeorm';
import { CvsModule } from './cvs/cvs.module';
import { SkillsModule } from './skills/skills.module';
import { UsersModule } from './users/users.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';

import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
dotenv.config();

@Module({
  imports: [
    FilesModule,
    CvsModule,
    SkillsModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      driver: require('mysql2'),
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: true,
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtAuthMiddleware).forRoutes('skills');
  }
}
