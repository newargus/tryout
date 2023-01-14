import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import { AppModule } from "./app.module";
import { LoggerInterceptor } from "./logger/logger.interceptor";
import { LoggerService } from "./logger/logger.service";
import { setupSwagger } from "./swagger";

async function bootstrap() {
  const env = process.env.NODE_ENV;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new LoggerInterceptor(new LoggerService))
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(cookieParser());
  app.set("trust proxy", true);

  await fs.promises.mkdir("./data/uploads/_temp", { recursive: true });

  app.setGlobalPrefix("api");
// swagger config
if (env !== 'production') {
  setupSwagger(app);
  /* const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nestjs API')
    .setDescription('Example Swagger')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document);*/
}

  await app.listen(8080);
}
bootstrap();
