import { Module } from '@nestjs/common';
import { UpdatedbService } from './updatedb.service';
import { TekModule } from '../tek/tek.module';
import { ProModule } from '../pro/pro.module';
import { SwModule } from '../sw/sw.module';

@Module({
  imports: [TekModule, ProModule, SwModule],
  providers: [UpdatedbService],
  exports: [UpdatedbService]
})
export class UpdatedbModule {}
