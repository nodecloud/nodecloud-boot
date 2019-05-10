'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.get = undefined;

let get = exports.get = (() => {
    var _ref = _asyncToGenerator(function* (path, defaults, options) {
        if (configs[path]) {
            return _lodash2.default.get(configs, path, defaults);
        } else {
            try {
                return yield config.get(path, defaults, options);
            } catch (e) {
                return _lodash2.default.get(configs, path, defaults);
            }
        }
    });

    return function get(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
})();

exports.watch = watch;

var _nodecloudConsulConfig = require('nodecloud-consul-config');

var _nodecloudConsulConfig2 = _interopRequireDefault(_nodecloudConsulConfig);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bootstrap = require('./bootstrap');

var bootstrap = _interopRequireWildcard(_bootstrap);

var _consul = require('../loadbalance/consul');

var _consul2 = _interopRequireDefault(_consul);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const config = new _nodecloudConsulConfig2.default(_consul2.default.client, bootstrap.getConfig('web.serviceName'), process.env.NODE_ENV, {
    format: 'yaml',
    token: bootstrap.getConfig('consul.token')
});

let configs = {};

config.watch(null, null, (err, data) => {
    configs = data;
}, { timeout: 300000 });
config.get().then(data => configs = data);

function watch(path, defaults, callback, options) {
    return config.watch(path, defaults, callback, options);
}