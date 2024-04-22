import type { LoggerService } from "@nestjs/common";

export class EmptyLogger implements LoggerService {
  log(message: string): any {
    return;
  }
  error(message: string, trace: string): any {
    return;
  }
  warn(message: string): any {
    return;
  }
  debug(message: string): any {
    return;
  }
  verbose(message: string): any {
    return;
  }
}
