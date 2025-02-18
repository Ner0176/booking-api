import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  BookingDto,
  CreateBookingDto,
  GetBookingsDto,
  GetUserBookingsDto,
} from './dtos';
import { Admin } from 'src/decorators';
import { Serialize } from 'src/interceptors';
import { Request } from 'express';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get('find')
  @Serialize(BookingDto)
  async getBookings(@Query() payload: GetBookingsDto) {
    return await this.bookingService.findAll(payload);
  }

  @Get('user/:userId')
  async getBookingsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() payload: GetUserBookingsDto,
  ) {
    return await this.bookingService.findBookingsFromUser(userId, payload);
  }

  @Post('create')
  async createBooking(@Body() payload: CreateBookingDto) {
    await this.bookingService.create(payload);
  }

  @Post('/update-status-cron')
  async updateBookingStatusCron() {
    return await this.bookingService.updateBookingStatus();
  }

  @Admin()
  @Patch('edit')
  async editClassBookings(@Body() payload: CreateBookingDto) {
    await this.bookingService.editClassBookings(payload);
  }

  @Patch(':id')
  async cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    await this.bookingService.cancelBooking(id, req['user'].id);
  }

  @Admin()
  @Delete(':id')
  @Serialize(BookingDto)
  async deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingService.deleteBooking(id);
  }
}
