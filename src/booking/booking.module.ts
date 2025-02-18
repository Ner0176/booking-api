import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ClassModule } from 'src/class/class.module';
import { UserModule } from 'src/user/user.module';
import { ClassConfigModules } from 'src/class-configs/class-configs.module';

@Module({
  exports: [BookingService],
  providers: [BookingService],
  controllers: [BookingController],
  imports: [
    UserModule,
    ClassConfigModules,
    forwardRef(() => ClassModule),
    TypeOrmModule.forFeature([Booking]),
  ],
})
export class BookingModule {}
