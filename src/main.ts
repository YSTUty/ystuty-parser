import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as requestIp from 'request-ip';
import * as xEnv from '@my-environment';

import { AppModule } from './models/app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(requestIp.mw({ attributeName: 'ip' }));
    app.enableShutdownHooks();

    await app.listen(xEnv.SERVER_PORT);

    if (xEnv.NODE_ENV !== xEnv.EnvType.PROD) {
        Logger.log(`🤬 Application is running on: ${await app.getUrl()}`, 'Bootstrap');
    } else {
        Logger.log(`🚀 Server is listening on port ${xEnv.SERVER_PORT}`, 'Bootstrap');
    }
}

bootstrap().catch((e) => {
    Logger.warn(`❌  Error starting server, ${e}`, 'Bootstrap');
    throw e;
});
