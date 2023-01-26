// import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Injectable } from '@nestjs/common';
// import { Response } from 'express';
// import { getI18nContextFromArgumentsHost } from 'nestjs-i18n';
// import * as _ from 'lodash';
// import { LogsService } from '../../settings/logs.service';

// @Injectable()
// @Catch(Error)
// export class HttpExceptionFilter implements ExceptionFilter {
//   constructor(private readonly _logService: LogsService) {}

//   async catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const status = exception?.getStatus ? exception.getStatus() : 500;
//     const errorType = exception.message;
//     const messages = ((exception?.getResponse ? exception.getResponse() : null) as any)?.message ?? exception.message;
//     const i18n = getI18nContextFromArgumentsHost(host);
//     const message = await i18n.t(messages ? (_.isArray(messages) ? messages[0] : messages) : errorType);
//     const error = { code: status, error: await i18n.t(errorType), message };
//     const data = {};

//     try {
//       const request = ctx.getRequest();
//       const token = request?.headers?.authorization?.split(' ')[1];
//       const action = request.url?.split('?')[0];
//       this._logService
//         .saveActionLog(token, action, {
//           code: status,
//           request: { params: request?.params, query: request?.query },
//           response: { error, data },
//         })
//         .then();
//     } catch (e) {}

//     response.status(status).send({
//       status: false,
//       error,
//       data,
//     });
//   }
// }
