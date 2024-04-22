import { Module } from '@nestjs/common';
import { ProService } from './pro.service';
import { ProApiService } from './api.service';
import { ProDataService } from './pro.api.getdata.service';
import { BottleneckProvider } from './probottleneck.provider';
import { ProCustomerService } from './pro.writecustomer.service';
import { ProInvoiceService } from './pro.writeinvoice.service';

@Module({
  providers: [
    ProService,
    ProApiService,
    ProDataService,
    ProCustomerService,
    ProInvoiceService,
    BottleneckProvider
  ],
  exports: [
    ProService,
    ProApiService,
    ProDataService,
    ProCustomerService,
    ProInvoiceService,
    BottleneckProvider
  ]
})
export class ProModule {}
