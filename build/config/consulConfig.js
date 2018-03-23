'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = get;
exports.watch = watch;

var _nodecloudConsulConfig = require('nodecloud-consul-config');

var _nodecloudConsulConfig2 = _interopRequireDefault(_nodecloudConsulConfig);

var _bootstrap = require('./bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _consul = require('../loadbalance/consul');

var _consul2 = _interopRequireDefault(_consul);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const config = new _nodecloudConsulConfig2.default(_consul2.default.client, bootstrap.getConfig('web.serviceName'), { format: 'yaml' });

function get(path, defaults, options) {
    return config.get(path, defaults, options);
}

function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}