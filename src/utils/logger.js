import fs from 'fs';
import path from 'path';
import moment from 'moment';
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
            colorize: true,
            label: bootstrap.getConfig('web.serviceName'),
            timestamp: () => {
                return moment(new Date().getTime()).format('YYYY-MM-DD h:mm:ss');
            },
        }),
        new winston.transports.File({
            name: 'info-file',
            filename: path.resolve(logPath, 'log.log'),
            maxsize: 100 * 1024 * 1024,
            label: bootstrap.get('web.serviceName'),
            timestamp: () => {
                return moment(new Date().getTime()).format('YYYY-MM-DD h:mm:ss');
            },
        }),
        new winston.transports.File({
            name: 'error-file',
            filename: path.resolve(logPath, 'log-error.log'),
            maxsize: 100 * 1024 * 1024,
            level: 'error',
            label: bootstrap.get('web.serviceName'),
            timestamp: () => {
                return moment(new Date().getTime()).format('YYYY-MM-DD h:mm:ss');
            },
        }),
    ],
});