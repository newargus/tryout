import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const buildSwagger = (app) => {
    const version = process.env.API_VERSION || '1.0';
    const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nestjs API')
    .setDescription('Example Swagger')
    .setVersion(version)
    .build();
    return SwaggerModule.createDocument(app, config);
}

export const setupSwagger = (app: INestApplication) => {
  const document = buildSwagger(app);
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  console.info(
    `Documentation: http://localhost:${process.env.PORT}/documentation`,
  );
};