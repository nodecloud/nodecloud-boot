import path from 'path';
import winston from 'winston';
import * as config from '../config/config';

const logPath = config.getConfig('logger.path', __dirname);

export default new winston.Logger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        new winston.transports.Console({
            colorize: true
        }),
        new winston.transports.File({
            name: 'info-file',
            filename: path.resolve(logPath, 'log-info.log'),
            maxsize: 100 * 1024 * 1024,
            level: 'info'
        }),
        new winston.transports.File({
            name: 'error-file',
            filename: path.resolve(logPath, 'log-error.log'),
            maxsize: 100 * 1024 * 1024,
            level: 'error'
        })
    ]
});