import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as helmet from "helmet";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet.default());
  app.enableCors();
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("WOWCards BACKEND")
    .setDescription("API DOCS of WOWCARDS")
    .setVersion("1.0")
    .addTag("api")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3009);
}
bootstrap();
