import fs from 'fs';
import path from 'path';
import moment from 'moment';
import {createLogger, transports, format} from 'winston';
import * as bootstrap from '../config/bootstrap';
import mkdirp from 'mkdirp';

const {combine, timestamp, label, printf} = format;
const logPath = bootstrap.getConfig('logger.path', __dirname);

if (!fs.existsSync(logPath)) {
    mkdirp.sync(logPath);
}

const myFormat = printf(info => {
    return `[${info.label}] [${moment(info.timestamp).format('YYYY-MM-DD h:mm:ss')}] [${info.level}]: ${info.message}`;
});

export default createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        format.colorize(),
        label({label: bootstrap.getConfig('web.serviceName')}),
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console({
            colorize: true
        }),
        new transports.File({
            name: 'info-file',
            filename: path.resolve(logPath, 'log-info.log'),
            maxsize: 100 * 1024 * 1024,
            level: 'info'
        }),
        new transports.File({
            name: 'error-file',
            filename: path.resolve(logPath, 'log-error.log'),
            maxsize: 100 * 1024 * 1024,
            level: 'error'
        })
    ]
});