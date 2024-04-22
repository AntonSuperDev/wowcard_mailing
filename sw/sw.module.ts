import { Module } from '@nestjs/common';
import { SwService } from './sw.service';
import { SWApiService } from './api.service';
import { SWCustomerService } from './sw.api.getcustomers.service';
import { SWRepairOrderService } from './sw.api.getrepairorders.service';

@Module({
  providers: [
    SwService,
    SWApiService,
    SWCustomerService,
    SWRepairOrderService
  ],
  exports: [
    SwService,
    SWApiService,
    SWCustomerService,
    SWRepairOrderService
  ]
})
export class SwModule {}
