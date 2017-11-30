import fs from 'fs';
import path from 'path';
import winston from 'winston';
import * as bootstrap from '../config/bootstrap';
import mkdirp from 'mkdirp';

const logPath = bootstrap.getConfig('logger.path', __dirname);

if (!fs.existsSync(logPath)) {
    mkdirp.sync(logPath);
}

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