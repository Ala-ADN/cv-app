import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CvsService } from './cvs.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { User } from '../decorators/user.decorator';
import { SearchCvDto } from './dto/search-cv.dto';
import { PaginationDto } from '../common/dto/pagination.dto'; 

@Controller('cvs')
export class CvsController {
  constructor(private readonly cvsService: CvsService) {}

  @Post()
  create(@Body() createCvDto: CreateCvDto, @User() user) {
    return this.cvsService.create(createCvDto, user);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/cvs',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  uploadCvFile(
    @UploadedFile() file,
    @Body() createCvDto: CreateCvDto,
    @User() user,
  ) {
    const modifiedDto = { ...createCvDto, path: file.path };
    return this.cvsService.create(modifiedDto, user);
  }

  @Get()
  findAll(
    @User() user: any,
    @Query('withSkills') withSkills?: string,
    @Query('withUser') withUser?: string,
  ) {
    const relations: string[] = [];
    if (withSkills === 'true') relations.push('skills');
    if (withUser === 'true') relations.push('user');

    return this.cvsService.findAll(
      user,
      relations.length ? relations : undefined,
    );
  }

  @Get()
  async findAllWithPagination(
    @User() user: any,
    @Query() pagination: PaginationDto, 
    @Query('withSkills') withSkills?: string,
    @Query('withUser') withUser?: string,
  ) {
    const relations: string[] = [];
    if (withSkills === 'true') relations.push('skills');
    if (withUser === 'true') relations.push('user');

    return this.cvsService.findAllWithPagination(
      user,
      relations,
      pagination
    );
  }

  



  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.cvsService.findByUser(userId);
  }

  @Get('skills/:skillId')
  findBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.cvsService.findBySkill(skillId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('withSkills') withSkills?: string,
    @Query('withUser') withUser?: string,
  ) {
    const relations: string[] = [];
    if (withSkills === 'true') relations.push('skills');
    if (withUser === 'true') relations.push('user');

    return this.cvsService.findOne(
      +id,
      relations.length ? relations : undefined,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvsService.update(+id, updateCvDto);
  }

  @Patch(':id/skills')
  updateSkills(
    @Param('id') id: string,
    @Body() skills: { skillIds: number[] },
  ) {
    return this.cvsService.updateSkills(+id, skills.skillIds);
  }

  @Patch(':id/user/:userId')
  assignToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.cvsService.assignToUser(id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cvsService.remove(+id);
  }

  @Delete(':id/skills/:skillId')
  removeSkill(
    @Param('id', ParseIntPipe) id: number,
    @Param('skillId', ParseIntPipe) skillId: number,
  ) {
    return this.cvsService.removeSkill(id, skillId);
  }
}
