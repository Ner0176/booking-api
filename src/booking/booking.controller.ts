import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post('create')
  async createBooking(@Body() payload: CreateBookingDto) {
    await this.bookingService.create(payload);
  }

  @Patch(':id')
  async cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingService.cancelBooking(id);
  }

  @Delete(':id')
  async deleteBooking(@Param('id', ParseIntPipe) id: number) {
    await this.bookingService.deleteBooking(id);
  }
}
