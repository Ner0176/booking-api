import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

@Module({
  providers: [BookingService],
  controllers: [BookingController],
  imports: [TypeOrmModule.forFeature([Booking])],
})
export class BookingModule {}
