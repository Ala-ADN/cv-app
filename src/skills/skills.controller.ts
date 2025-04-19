import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('skills')
@UseInterceptors(ClassSerializerInterceptor)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  findAll(@Query('withCvs') withCvs?: string) {
    return this.skillsService.findAll(withCvs === 'true');
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('withCvs') withCvs?: string,
  ) {
    return this.skillsService.findOne(id, withCvs === 'true');
  }

  @Get('popular/top')
  findPopularSkills(@Query('limit') limit: string = '5') {
    return this.skillsService.findPopularSkills(+limit);
  }

  @Get('cv/:cvId')
  findByCv(@Param('cvId', ParseIntPipe) cvId: number) {
    return this.skillsService.findByCv(cvId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.remove(id);
  }
}
