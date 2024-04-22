import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  DatabaseError,
  Pool,
  PoolConfig,
  QueryConfig,
  QueryResultRow,
} from "pg";

/**
 * Wrapper class for {@link Pool} that allows us to capture the stack trace
 * for the calling code that uses {@link PoolExt.query}.
 */
export class PoolExt extends Pool {
  constructor(config?: PoolConfig | undefined) {
    super(config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<R extends QueryResultRow = any, I extends any[] = any[]>(
    queryTextOrConfig: string | QueryConfig<I>,
    values?: I,
  ) {
    try {
      return await super.query<R, I>(queryTextOrConfig, values);
    } catch (err: unknown) {
      const dbError = err as DatabaseError;
      throw new Error(`DB query error: ${dbError.message}`, { cause: err });
    }
  }
}

const dbProvider = {
  provide: "DB_CONNECTION",
  useFactory: (config: ConfigService) => {
    // DigitalOcean uses self-signed certificates on its servers. You need to
    // pass their CA certificate to the Postgres client in order to securely
    // connect without getting an SSL error. node-postgres has a bug where the
    // connection string "sslmode" parameter overrides the provided "ssl"
    // options property. Remove the query parameter so the client uses the
    // provided "ssl" options.
    // https://github.com/brianc/node-postgres/issues/2558#issuecomment-855703980
    const connectionString = new URL(config.get<string>("DATABASE_URL", ""));
    connectionString.searchParams.delete("sslmode");
    connectionString.searchParams.delete("ssl");

    return new PoolExt({
      connectionString: connectionString.toString(),
      ...(config.get<string>("DB_USE_SSL") !== "true"
        ? {}
        : { ssl: { ca: config.get<string>("CA_CERT") } }),
    });
  },
  imports: [ConfigModule],
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
