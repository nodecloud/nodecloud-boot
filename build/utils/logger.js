'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _winston = require('winston');

var _bootstrap = require('../config/bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { combine, timestamp, label, printf } = _winston.format;
const logPath = bootstrap.getConfig('logger.path', __dirname);

if (!_fs2.default.existsSync(logPath)) {
    _mkdirp2.default.sync(logPath);
}

const myFormat = printf(info => {
    return `[${info.label}] [${(0, _moment2.default)(info.timestamp).format('YYYY-MM-DD h:mm:ss')}] [${info.level}]: ${info.message}`;
});

exports.default = (0, _winston.createLogger)({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(_winston.format.colorize(), label({ label: bootstrap.getConfig('web.serviceName') }), timestamp(), myFormat),
    transports: [new _winston.transports.Console({
        colorize: true
    }), new _winston.transports.File({
        name: 'info-file',
        filename: _path2.default.resolve(logPath, 'log-info.log'),
        maxsize: 100 * 1024 * 1024,
        level: 'info'
    }), new _winston.transports.File({
        name: 'error-file',
        filename: _path2.default.resolve(logPath, 'log-error.log'),
        maxsize: 100 * 1024 * 1024,
        level: 'error'
    })]
});