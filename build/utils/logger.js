'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _config = require('../config/config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logPath = config.getConfig('logger.path', __dirname);

exports.default = new _winston2.default.Logger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [new _winston2.default.transports.Console({
        colorize: true
    }), new _winston2.default.transports.File({
        name: 'info-file',
        filename: _path2.default.resolve(logPath, 'log-info.log'),
        maxsize: 100 * 1024 * 1024,
        level: 'info'
    }), new _winston2.default.transports.File({
        name: 'error-file',
        filename: _path2.default.resolve(logPath, 'log-error.log'),
        maxsize: 100 * 1024 * 1024,
        level: 'error'
    })]
});