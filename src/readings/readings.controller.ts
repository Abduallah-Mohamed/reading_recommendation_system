import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { CreateReadingDto } from './dto/create-readings.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from 'src/common';
import { User } from 'src/users/entities/user.entity';

@Controller('readings')
@UseGuards(JwtAuthGuard)
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reading' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request.',
  })
  create(
    @Body() createReadingDto: CreateReadingDto,
    @CurrentUser() user: User,
  ) {
    return this.readingsService.create(createReadingDto, user);
  }
}
