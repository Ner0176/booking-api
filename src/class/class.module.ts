import { forwardRef, Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  exports: [ClassService],
  providers: [ClassService],
  controllers: [ClassController],
  imports: [TypeOrmModule.forFeature([Class]), forwardRef(() => BookingModule)],
})
export class ClassModule {}
