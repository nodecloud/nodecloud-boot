'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = get;
exports.watch = watch;

var _nodecloudConsulConfig = require('nodecloud-consul-config');

var _nodecloudConsulConfig2 = _interopRequireDefault(_nodecloudConsulConfig);

var _consul = require('../loadbalance/consul');

var _consul2 = _interopRequireDefault(_consul);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const config = new _nodecloudConsulConfig2.default(_consul2.default.client, { format: 'yaml' });

function get(path, defaults, options) {
    return config.get(path, defaults, options);
}

function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}