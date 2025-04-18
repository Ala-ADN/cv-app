import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('withCvs') withCvs?: string) {
    return this.usersService.findAll(withCvs === 'true');
  }

  @Get('stats/most-cvs')
  findUsersWithMostCvs(@Query('limit') limit: string = '5') {
    return this.usersService.findUsersWithMostCvs(+limit);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('withCvs') withCvs?: string,
  ) {
    return this.usersService.findOne(id, withCvs === 'true');
  }

  @Get(':id/cvs')
  findUserCvs(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findUserCvs(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Delete(':id/cvs/:cvId')
  removeCvFromUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('cvId', ParseIntPipe) cvId: number,
  ) {
    return this.usersService.removeCvFromUser(id, cvId);
  }
}
