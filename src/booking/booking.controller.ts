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
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingDto, CreateBookingDto, GetBookingsDto } from './dtos';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Controller('booking')
@Serialize(BookingDto)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Get('find')
  async getBookings(@Query() payload: GetBookingsDto) {
    return await this.bookingService.findAll(payload);
  }

  @Post('create')
  async createBooking(@Body() payload: CreateBookingDto) {
    await this.bookingService.create(payload);
  }

  @Patch('edit')
  async editClassBookings(@Body() payload: CreateBookingDto) {
    await this.bookingService.editClassBookings(payload);
  }

  @Patch(':id')
  async cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingService.cancelBooking(id);
  }

  @Delete(':id')
  async deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingService.deleteBooking(id);
  }
}
