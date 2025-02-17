import { Module } from '@nestjs/common';
import { ClassConfigsController } from './class-configs.controller';
import { ClassConfigsService } from './class-configs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassConfigs } from './class-configs.entity';

@Module({
  exports: [ClassConfigsService],
  providers: [ClassConfigsService],
  controllers: [ClassConfigsController],
  imports: [TypeOrmModule.forFeature([ClassConfigs])],
})
export class ClassConfigModules {}
