'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _nodecloudConfigClient = require('nodecloud-config-client');

var _nodecloudConfigClient2 = _interopRequireDefault(_nodecloudConfigClient);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

var _loadbalance = require('../loadbalance/loadbalance');

var loadbalanceClient = _interopRequireWildcard(_loadbalance);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const client = loadbalanceClient.getClient(config.getConfig('config.server.name', 'multi-cloud-config-service'));
const configClient = new _nodecloudConfigClient2.default({
    remote: {
        client: {
            send: (() => {
                var _ref = _asyncToGenerator(function* (request) {
                    const response = yield client.send(request);
                    return response.body;
                });

                return function send(_x) {
                    return _ref.apply(this, arguments);
                };
            })()
        },
        url: config.getConfig('config.server.url', '/multi-cloud-config-service/v1/config/:service/:env/inner'),
        service: config.getConfig('config.server.client'),
        interval: config.getConfig('config.server.interval', 60000)
    },
    local: {
        path: config.getConfig('config.local.path', __dirname),
        service: config.getConfig('config.local.service', 'application'),
        ext: config.getConfig('config.local.ext', 'js')
    }
});

configClient.on(_nodecloudConfigClient.ERROR_EVENT, err => {
    _logger2.default.error(`Refresh config error.`, err);
});

exports.default = configClient;