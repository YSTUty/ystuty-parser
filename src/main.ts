import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as swStats from 'swagger-stats';
import * as requestIp from 'request-ip';
import * as compression from 'compression';
import { json } from 'body-parser';
import * as cors from 'cors';
import helmet from 'helmet';

import * as xEnv from '@my-environment';
import { HttpExceptionFilter, ValidationHttpPipe } from '@my-common';

import { AppModule } from './models/app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
    });

    app.use(compression());
    app.use(cors());
    app.use(
        helmet({
            contentSecurityPolicy:
                xEnv.NODE_ENV === xEnv.EnvType.PROD ? undefined : false,
        }),
    );
    app.use(json());

    app.useGlobalPipes(new ValidationHttpPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());

    app.use(requestIp.mw({ attributeName: 'ip' }));
    app.enableShutdownHooks();

    if (xEnv.SWAGGER_ACCESS_USERNAME) {
        if (xEnv.SWAGGER_ACCESS_PASSWORD) {
            app.use(
                ['/swagger', '/swagger-json'],
                basicAuth({
                    challenge: true,
                    users: {
                        [xEnv.SWAGGER_ACCESS_USERNAME]:
                            xEnv.SWAGGER_ACCESS_PASSWORD,
                    },
                }),
            );
        }
        if (
            xEnv.SWAGGER_ACCESS_PASSWORD_STATS ||
            xEnv.SWAGGER_ACCESS_PASSWORD
        ) {
            app.use(
                ['/swagger-stats'],
                basicAuth({
                    challenge: true,
                    users: {
                        [xEnv.SWAGGER_ACCESS_USERNAME]:
                            xEnv.SWAGGER_ACCESS_PASSWORD_STATS ||
                            xEnv.SWAGGER_ACCESS_PASSWORD,
                    },
                }),
            );
        }
    }

    const swaggerConfig = new DocumentBuilder()
        .setTitle(`${xEnv.APP_NAME} API`)
        .setDescription('This documentation describes the YSTUty Parser API.')
        .setVersion('1.0.1')
        .addTag('ystu', 'YSTU parser')
        .addTag('calendar', 'Calendar events')
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
