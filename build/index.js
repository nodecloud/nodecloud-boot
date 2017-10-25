'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _config = require('./config/config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
    getInstance(configPath) {
        config.configs.path = configPath;
        return require('./NodeCloudBoot');
    }
};