import { Module } from "@nestjs/common";
import { TekModule } from "../tek/tek.module";
import { SwModule } from "../sw/sw.module";
import { ProModule } from "../pro/pro.module";
import { MitModule } from "../mit/mit.module";
import { NapModule } from "../nap/nap.module";
import { ListcleanupService } from "./listcleanup.service";
import { ListcleanupNameService } from "./listcleanup.name.service";
import { ListcleanupAddressService } from "./listcleanup.address.service";
import { ListcleanupDedupeService } from "./listcleanup.dedupe.service";

@Module({
  imports: [TekModule, SwModule, ProModule, MitModule, NapModule],
  providers: [
    ListcleanupService,
    ListcleanupNameService,
    ListcleanupAddressService,
    ListcleanupDedupeService,
  ],
  exports: [
    ListcleanupService,
    ListcleanupNameService,
    ListcleanupAddressService,
    ListcleanupDedupeService,
  ],
})
export class ListcleanupModule {}
