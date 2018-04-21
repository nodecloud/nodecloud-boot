'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bootstrap = require('./config/bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _tracing = require('./tracing');

var _tracing2 = _interopRequireDefault(_tracing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = {
    getInstance(configPath) {
        bootstrap.setPath(configPath);
        if (bootstrap.getConfig('tracing', false)) {
            (0, _tracing2.default)();
        }
        return require('./NodeCloudBoot');
    }
};