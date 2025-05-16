import { Controller, Get, Param } from '@nestjs/common';
import { CvEventService } from './cv-event.service';

@Controller('cv-events')
export class CvEventController {
  constructor(private readonly cvEventService: CvEventService) {}

  @Get()
  findAll() {
    return this.cvEventService.findAll();
  }

  @Get('cv/:cvId')
  findByCv(@Param('cvId') cvId: number) {
    return this.cvEventService.findByCv(cvId);
  }
}
