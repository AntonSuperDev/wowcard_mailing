import { Injectable } from "@nestjs/common";

@Injectable()
class ConfigServiceMock {
  get(key: string, defaultValue?: string) {
    switch (key) {
      case "DB_AES_SECRET":
        // Randomly generated key; not used elsewhere
        return "e1a55f305a6832e4de016f00ece4a1af6bb654047de0ffdff787a8443681aa4a";
      case "SYSTEM_NOTIFICATION_RECIPIENTS":
        return "system@dev.null,ops@dev.null";
      case "SALES_NOTIFICATION_RECIPIENTS":
        return "sales@dev.null";
      default:
        return defaultValue;
    }
  }
}

export { ConfigServiceMock as ConfigService };
