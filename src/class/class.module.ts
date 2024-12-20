import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';

@Module({
  exports: [ClassService],
  providers: [ClassService],
  controllers: [ClassController],
  imports: [TypeOrmModule.forFeature([Class])],
})
export class ClassModule {}
