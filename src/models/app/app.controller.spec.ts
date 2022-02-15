import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    describe('root', () => {
        it('should return "IP:::ffff:127.0.0.1"', () => {
            expect(appController.getIp('::ffff:127.0.0.1')).toBe(
                'IP:::ffff:127.0.0.1',
            );
        });
    });
});
