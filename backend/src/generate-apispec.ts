import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import * as YAML from 'yaml'

import { AppModule } from './app.module';
import { buildSwagger } from './swagger';

export const setupSwaggerDoc = async () => {
  const app = await NestFactory.create(AppModule);

  const document = buildSwagger(app);
  fs.writeFileSync('openapi.yaml', YAML.stringify(document));
};

setupSwaggerDoc();