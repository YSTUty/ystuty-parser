import { HttpStatus, ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        if (host.getType() !== 'http') {
            return exception;
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const expResponse = exception.getResponse();
        const message = exception.message;
        const error = exception.name;
        const payload = typeof expResponse === 'object' ? (expResponse as any).payload : {};

        response.status(status).json({
            statusCode: status,
            message,
            error,
            timestamp: new Date().toISOString(),
            ...(payload && { payload }),
        });
    }
}
