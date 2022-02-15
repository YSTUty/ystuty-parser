import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as swStats from 'swagger-stats';
import * as requestIp from 'request-ip';

import * as xEnv from '@my-environment';
import { HttpExceptionFilter } from '@my-common';

import { AppModule } from './models/app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new HttpExceptionFilter());

    app.use(requestIp.mw({ attributeName: 'ip' }));
    app.enableShutdownHooks();

    if (xEnv.SWAGGER_ACCESS_USERNAME) {
        app.use(
            ['/swagger', '/swagger-json', '/swagger-stats'],
            basicAuth({
                challenge: true,
                users: {
                    [xEnv.SWAGGER_ACCESS_USERNAME]:
                        xEnv.SWAGGER_ACCESS_PASSWORD,
                },
            }),
        );
    }

    const swaggerConfig = new DocumentBuilder()
        .setTitle('YSTUty API')
        .setDescription('This documentation describes the YSTUty API.')
        .setVersion('1.0')
        .addTag('ystu')
        .build();
    const swaggerSpec = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerSpec, {});

    app.use(swStats.getMiddleware({ swaggerSpec }));

    await app.listen(xEnv.SERVER_PORT);

    if (xEnv.NODE_ENV !== xEnv.EnvType.PROD) {
        Logger.log(
            `🤬 Application is running on: ${await app.getUrl()}`,
            'Bootstrap',
        );
    } else {
        Logger.log(
            `🚀 Server is listening on port ${xEnv.SERVER_PORT}`,
            'Bootstrap',
        );
    }
}

bootstrap().catch((e) => {
    Logger.warn(`❌  Error starting server, ${e}`, 'Bootstrap');
    throw e;
});
