import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ClassModule } from 'src/class/class.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [BookingService],
  controllers: [BookingController],
  imports: [TypeOrmModule.forFeature([Booking]), ClassModule, UserModule],
})
export class BookingModule {}
