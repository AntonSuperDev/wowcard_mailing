import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";
import { Pool } from "pg";
// import { customerObject } from "../bdayappend/bdayappend.service";
// import { bdayCustomerObject } from "../bdayappend/bdayappend.service";
// import { BdayAppendDistanceService } from "../bdayappend/bdayappend.distance.service";
// import { BdayappendService } from "../bdayappend/bdayappend.service";

@Injectable()
export class MailinglistPhoneService {
  constructor(
    @Inject("DB_CONNECTION") private readonly db: Pool,
    // private readonly bdayAppendDistanceService: BdayAppendDistanceService,
    // private readonly bdayAppendService: BdayappendService,
  ) {}
}
